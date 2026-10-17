import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient = null;
let connectionAttempted = false;
let isRedisAvailable = false;

// Safe no-op mock for when Redis is offline or timing out
const mockRedis = {
  isOpen: false,
  isReady: false,
  get: async () => null,
  set: async () => 'OK',
  setEx: async () => 'OK',
  del: async () => 0,
  zAdd: async () => 0,
  zRangeByScore: async () => [],
  zRemRangeByScore: async () => 0,
  connect: async () => {},
  disconnect: async () => {},
  quit: async () => {},
  on: () => {},
};

const initRedis = async () => {
  if (redisClient && isRedisAvailable) {
    return redisClient;
  }

  // If already tried and failed, return mock immediately without hanging
  if (connectionAttempted && !isRedisAvailable) {
    return mockRedis;
  }

  connectionAttempted = true;

  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD) {
    console.warn('⚠️ Redis config missing. Operating seamlessly in fallback mode.');
    isRedisAvailable = false;
    return mockRedis;
  }

  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        connectTimeout: 2000,
        reconnectStrategy: false, // Don't hang indefinitely on connection failures
      },
      password: process.env.REDIS_PASSWORD,
    });

    client.on('error', () => {
      // Quietly suppress connection error spam in console
    });

    // Timeout connecting after 2000ms
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    redisClient = client;
    isRedisAvailable = true;
    console.log('✅ Redis connected successfully');
    return redisClient;
  } catch (err) {
    console.warn(`⚠️ Redis unreachable (${err.message}). Seamlessly running in fallback mode.`);
    isRedisAvailable = false;
    redisClient = null;
    return mockRedis;
  }
};

export { initRedis, redisClient };
