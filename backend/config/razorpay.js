// config/razorpay.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Setting from "../models/setting.js";

let razorpayInstance = null;
let cachedKeyId = null;
let cachedKeySecret = null;

/**
 * Retrieves Razorpay Key ID and Secret with DB-first and process.env fallback strategy.
 */
export const getRazorpayKeys = async () => {
  let keyId = null;
  let keySecret = null;

  try {
    const settings = await Setting.find({
      key: { $in: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] }
    }).select("key value");

    settings.forEach((s) => {
      if (s.key === "RAZORPAY_KEY_ID" && s.value) keyId = s.value;
      if (s.key === "RAZORPAY_KEY_SECRET" && s.value) keySecret = s.value;
    });
  } catch (err) {
    console.warn("Could not load Razorpay settings from DB, falling back to env:", err.message);
  }

  // Fallback to environment variables
  if (!keyId) keyId = process.env.RAZORPAY_KEY_ID;
  if (!keySecret) keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) not configured in DB or .env");
  }

  return { keyId, keySecret };
};

/**
 * Returns a configured Razorpay instance (cached if keys haven't changed).
 */
export const getRazorpayInstance = async () => {
  const { keyId, keySecret } = await getRazorpayKeys();

  if (razorpayInstance && cachedKeyId === keyId && cachedKeySecret === keySecret) {
    return razorpayInstance;
  }

  cachedKeyId = keyId;
  cachedKeySecret = keySecret;
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
};

/**
 * Verifies Razorpay payment signature using HMAC SHA-256.
 * @param {Object} params - { orderId, paymentId, signature }
 * @returns {Promise<boolean>}
 */
export const verifyRazorpaySignature = async ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const { keySecret } = await getRazorpayKeys();
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === signature;
};

export default getRazorpayInstance;
