import jwt from "jsonwebtoken";
import crypto from 'crypto';
import RevokedAccessToken from '../../models/RevokedAccessToken.js';
import UserRefreshToken from "../../models/UserRefreshToken.js";
import { ServerConfig } from "../../config/server.config.js";
import { initRedis } from "../../config/redisClient.js";

let redisInstance = null;
const getRedis = async () => {
  try {
    if (!redisInstance) redisInstance = await initRedis();
    return redisInstance;
  } catch (err) {
    console.warn("[REDIS] Redis unavailable, using in-memory fallback");
    return null;
  }
};

// In-memory fallback stores
const memoryBlacklist = new Map();
const memoryUserTokens = new Map();

const ACCESS_TOKEN_BLACKLIST_PREFIX = "accessToken:blacklist:";
const USER_ACCESS_TOKENS_PREFIX = "user:accessTokens:";

// Store issued access token for user in Redis or fallback
const storeAccessTokenForUser = async (userId, token, exp, platform = "web") => {
  const redis = await getRedis();
  const platformKey = platform === "web" ? "web" : "app";
  const key = `${USER_ACCESS_TOKENS_PREFIX}${platformKey}:${userId}`;

  if (redis) {
    // Store token with expiration as score in a sorted set
    await redis.zAdd(key, [{ score: exp, value: token }]);
  } else {
    const memKey = `${userId}:${platformKey}`;
    if (!memoryUserTokens.has(memKey)) memoryUserTokens.set(memKey, []);
    memoryUserTokens.get(memKey).push({ token, exp });
  }
};

// Get all active access tokens for user from Redis or fallback
const getAllAccessTokensForUser = async (userId, platform = "web") => {
  const redis = await getRedis();
  const platformKey = platform === "web" ? "web" : "app";
  const key = `${USER_ACCESS_TOKENS_PREFIX}${platformKey}:${userId}`;

  if (redis) {
    // Get all tokens with expiration > now
    const now = Date.now();
    return await redis.zRangeByScore(key, now, '+inf');
  } else {
    const now = Date.now();
    const memKey = `${userId}:${platformKey}`;
    return (memoryUserTokens.get(memKey) || [])
      .filter(t => t.exp > now)
      .map(t => t.token);
  }
};

// Remove expired tokens from user's set
const cleanupExpiredAccessTokensForUser = async (userId, platform = "web") => {
  const redis = await getRedis();
  const platformKey = platform === "web" ? "web" : "app";
  const key = `${USER_ACCESS_TOKENS_PREFIX}${platformKey}:${userId}`;

  if (redis) {
    const now = Date.now();
    await redis.zRemRangeByScore(key, '-inf', now);
  } else {
    const memKey = `${userId}:${platformKey}`;
    if (memoryUserTokens.has(memKey)) {
      const now = Date.now();
      memoryUserTokens.set(memKey, memoryUserTokens.get(memKey).filter(t => t.exp > now));
    }
  }
};

const blacklistAccessToken = async (token, exp) => {
  const redis = await getRedis();
  // Set blacklist with TTL equal to token's remaining lifetime
  const ttl = Math.floor((exp - Date.now()) / 1000);
  if (ttl > 0) {
    await RevokedAccessToken.updateOne(
      { _id: crypto.createHash('sha256').update(token).digest('hex') },
      { $set: { expiresAt: new Date(exp) } }, { upsert: true }
    );
    if (redis) {
      await redis.setEx(`${ACCESS_TOKEN_BLACKLIST_PREFIX}${token}`, ttl, "1");
    }
    memoryBlacklist.set(token, Date.now() + ttl * 1000);
    //console.log(`[BLACKLIST] Token ${token.substring(0, 12)}... set for ${ttl}s`);
  } else {
    //console.log(`[BLACKLIST] Token ${token.substring(0, 12)}... not set (expired)`);
  }
};

const isAccessTokenBlacklisted = async (token, user) => {
  if (await RevokedAccessToken.exists({ _id: crypto.createHash('sha256').update(token).digest('hex'), expiresAt: { $gt: new Date() } })) return true;
  const redis = await getRedis();
  if (redis) {
    const result = await redis.get(`${ACCESS_TOKEN_BLACKLIST_PREFIX}${token}`);
    if (result === "1") return true;
  }
  const expiry = memoryBlacklist.get(token);
  return !!(expiry && expiry > Date.now());
};

const getTokenExp = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const generateTokens = async (user, platform = "web", deviceId = null) => {
  try {
    if (!user || !user._id) {
      throw new Error("User object is missing or invalid");
    }

    const payload = { _id: user._id, roles: user.role || user.roles, platform, sessionVersion: user.sessionVersion || 0 };

    // Define secrets
    const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY || process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

    if (!accessSecret || !refreshSecret) {
      throw new Error("JWT secrets are not defined in environment variables");
    }

    // Generate tokens with bounded lifetime (1d access, 30d refresh)
    const accessExpires = process.env.JWT_ACCESS_EXPIRES_IN || '1d';
    const refreshExpires = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpires });
    const refreshToken = jwt.sign(
      { ...payload, jti: crypto.randomUUID() },
      refreshSecret,
      { expiresIn: refreshExpires }
    );

    // Calculate expiration times
    const decodedAccess = jwt.decode(accessToken);
    const decodedRefresh = jwt.decode(refreshToken);

    const accessTokenExp = decodedAccess?.exp ? decodedAccess.exp * 1000 : Date.now() + 1000 * 60 * 60 * 24;
    const refreshTokenExp = decodedRefresh?.exp ? decodedRefresh.exp * 1000 : Date.now() + 1000 * 60 * 60 * 24 * 30;

    // Invalidate previous refresh tokens for the SAME platform only
    // This allows web + app to coexist, but only 1 device per platform
    await UserRefreshToken.deleteMany({ 
      userId: user._id, 
      platform: platform === "web" ? "web" : { $in: ["app", "android", "ios"] }
    });

    // Save new refresh token safely
    try {
      const newRefreshToken = new UserRefreshToken({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(refreshTokenExp),
        platform: platform,
        deviceId: deviceId
      });
      await newRefreshToken.save();
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        await UserRefreshToken.updateOne(
          { token: refreshToken },
          { $set: { expiresAt: new Date(refreshTokenExp), userId: user._id, platform } },
          { upsert: true }
        );
      } else {
        throw saveErr;
      }
    }

    // Blacklist previous tokens (if not admin/super_admin/instructor) ONLY for the current platform
    // This allows web + one app device to coexist
    const adminRoles = ["admin", "super_admin", "superadmin", "instructor", "news_editor"];
    const isAdmin = adminRoles.includes(user?.role) || 
                   (Array.isArray(user?.roles) && user?.roles.some(r => adminRoles.includes(r))) || 
                   adminRoles.includes(user?.roles);
    
    if (!isAdmin) {
      await cleanupExpiredAccessTokensForUser(user._id, platform);
      const previousTokens = await getAllAccessTokensForUser(user._id, platform);

      if (previousTokens.length > 0) {
        const now = Date.now();
        const blacklistPromise = previousTokens.map((prevToken) => {
          const exp = getTokenExp(prevToken) || (now + 1000 * 60 * 60);
          return blacklistAccessToken(prevToken, exp);
        });
        await Promise.all(blacklistPromise);

        // Clear the specific platform's access token list from Redis
        const redis = await getRedis();
        if (redis) {
          const platformKey = platform === "web" ? "web" : "app";
          const key = `${USER_ACCESS_TOKENS_PREFIX}${platformKey}:${user._id}`;
          await redis.del(key);
        }
      }
    }

    // Store new access token for user in Redis under platform key
    await storeAccessTokenForUser(user._id, accessToken, accessTokenExp, platform);

    return {
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    };
  } catch (error) {
    console.error('❌ Error in generateTokens:', error);
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

const generateTokenForResetPassword = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.role };
    const secret = ServerConfig.JWT_EMAIL_RESET_SECRET;
    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
    return token;
  } catch (error) {
    console.error('❌ Error in generateTokenForResetPassword:', error);
    throw new Error(`Reset token generation failed: ${error.message}`);
  }
};

export { generateTokens, generateTokenForResetPassword, isAccessTokenBlacklisted, blacklistAccessToken, cleanupExpiredAccessTokensForUser, getAllAccessTokensForUser };

// Only refresh tokens are stored and managed for session control.
// Access tokens are stateless and cannot be forcibly invalidated unless you implement a blacklist.
// Use isAccessTokenBlacklisted(token) in your auth middleware to reject blacklisted tokens.
