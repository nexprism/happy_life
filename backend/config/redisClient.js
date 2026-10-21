import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;
let isRedisAvailable = false;

// High-fidelity in-memory fallback store when Redis is offline or timing out
const mockStore = new Map();

const isExpired = (item) => {
  if (!item) return true;
  if (item.expiresAt && item.expiresAt <= Date.now()) return true;
  return false;
};

const mockRedis = {
  consumeValue: async (key, expected) => {
    const item = mockStore.get(key);
    if (isExpired(item) || item.value !== expected) return false;
    mockStore.delete(key);
    return true;
  },
  isOpen: true,
  isReady: true,
  get: async (key) => {
    const item = mockStore.get(key);
    if (!item) return null;
    if (isExpired(item)) {
      mockStore.delete(key);
      return null;
    }
    return item.value;
  },
  set: async (key, value, options = {}) => {
    mockStore.set(key, { value: String(value), expiresAt: options.EX ? Date.now() + Number(options.EX) * 1000 : null });
    return 'OK';
  },
  setEx: async (key, seconds, value) => {
    mockStore.set(key, { value: String(value), expiresAt: Date.now() + Number(seconds) * 1000 });
    return 'OK';
  },
  del: async (keys) => {
    let count = 0;
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const k of keyList) {
      if (typeof k === 'string' && k.includes('*')) {
        const regex = new RegExp('^' + k.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
        for (const storeKey of Array.from(mockStore.keys())) {
          if (regex.test(storeKey)) {
            mockStore.delete(storeKey);
            count++;
          }
        }
      } else {
        if (mockStore.delete(k)) count++;
      }
    }
    return count;
  },
  incr: async (key) => {
    const item = mockStore.get(key);
    let val = 0;
    let expiresAt = null;
    if (item && !isExpired(item)) {
      val = parseInt(item.value, 10) || 0;
      expiresAt = item.expiresAt;
    }
    val += 1;
    mockStore.set(key, { value: String(val), expiresAt });
    return val;
  },
  expire: async (key, seconds) => {
    const item = mockStore.get(key);
    if (!item || isExpired(item)) return 0;
    item.expiresAt = Date.now() + Number(seconds) * 1000;
    mockStore.set(key, item);
    return 1;
  },
  keys: async (pattern = '*') => {
    const regex = new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    const matched = [];
    for (const [k, item] of mockStore.entries()) {
      if (!isExpired(item) && regex.test(k)) {
        matched.push(k);
      }
    }
    return matched;
  },
  zAdd: async (key, entries) => {
    const item = mockStore.get(key);
    const values = !isExpired(item) && item.value instanceof Map ? item.value : new Map();
    let added = 0;
    for (const { value, score } of entries) { if (!values.has(value)) added++; values.set(value, Number(score)); }
    mockStore.set(key, { value: values, expiresAt: null });
    return added;
  },
  zRangeByScore: async (key, min, max) => {
    const item = mockStore.get(key);
    if (isExpired(item) || !(item.value instanceof Map)) return [];
    return [...item.value].filter(([, s]) => s >= Number(min === '-inf' ? -Infinity : min) && s <= Number(max === '+inf' ? Infinity : max)).sort((a, b) => a[1] - b[1]).map(([v]) => v);
  },
  zRemRangeByScore: async (key, min, max) => {
    const values = await mockRedis.zRangeByScore(key, min, max);
    for (const value of values) mockStore.get(key).value.delete(value);
    return values.length;
  },
  connect: async () => {},
  disconnect: async () => {},
  quit: async () => {},
  on: () => {},
};

export const deleteKeysByPattern = async (pattern) => {
  try {
    const redis = await initRedis();
    if (!redis) return;
    if (typeof redis.keys === 'function') {
      const keys = await redis.keys(pattern);
      if (keys && keys.length > 0) {
        await redis.del(keys);
      }
    } else {
      await redis.del(pattern);
    }
  } catch (err) {
    // Non-fatal cache invalidation
  }
};

let isConnecting = false;
let lastFailureTime = 0;
const RETRY_COOLDOWN_MS = 15000; // Wait 15s before attempting reconnection if Redis is down

const initRedis = async () => {
  if (redisClient && isRedisAvailable && redisClient.isOpen) {
    return redisClient;
  }

  // If redis credentials are not configured, always use fallback
  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD) {
    isRedisAvailable = false;
    return mockRedis;
  }

  // If currently attempting connection, return mock to avoid parallel connection attempts
  if (isConnecting) {
    return mockRedis;
  }

  // If we recently failed or disconnected, avoid hanging requests with repeated timeouts
  if (Date.now() - lastFailureTime < RETRY_COOLDOWN_MS) {
    return mockRedis;
  }

  isConnecting = true;

  try {
    if (redisClient) {
      try {
        await redisClient.disconnect();
      } catch (_) {}
      redisClient = null;
    }

    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        connectTimeout: 2500,
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            return false; // Stop internal loop; initRedis will manage future reconnects
          }
          return Math.min(retries * 200, 2000);
        },
      },
      password: process.env.REDIS_PASSWORD,
    });

    client.on('error', (err) => {
      // Quietly suppress spam; mark unavailable if socket closed
      if (!client.isOpen) {
        isRedisAvailable = false;
      }
    });

    client.on('end', () => {
      isRedisAvailable = false;
      if (redisClient === client) {
        redisClient = null;
      }
    });

    client.on('ready', () => {
      isRedisAvailable = true;
      redisClient = client;
    });

    // Timeout connecting after 2500ms
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timeout')), 2500)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    redisClient = client;
    isRedisAvailable = true;
    console.log('✅ Redis connected successfully');
    return redisClient;
  } catch (err) {
    lastFailureTime = Date.now();
    isRedisAvailable = false;
    redisClient = null;
    console.warn(`⚠️ Redis unreachable (${err.message}). Seamlessly running in fallback mode.`);
    return mockRedis;
  } finally {
    isConnecting = false;
  }
};

export { initRedis, redisClient };
