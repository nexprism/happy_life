import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { getRazorpayKeys, getRazorpayInstance, verifyRazorpaySignature } from '../config/razorpay.js';
import * as checkoutController from '../controllers/checkoutController.js';
import * as eventController from '../controllers/EventController.js';
import * as ebookController from '../controllers/ebookController.js';
import * as testSeriesController from '../controllers/testSeriesController.js';
import * as settingController from '../controllers/settingController.js';

async function testAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');

    const keys = await getRazorpayKeys();
    console.log('Razorpay Key ID:', keys.keyId);

    // Test signature verification
    const testOrderId = 'order_test123456';
    const testPaymentId = 'pay_test123456';
    const crypto = await import('crypto');
    const validSignature = crypto.default
      .createHmac('sha256', keys.keySecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const isMatch = await verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: validSignature,
    });
    console.log('HMAC SHA-256 Signature verification test result (should be true):', isMatch);

    const isBadMatch = await verifyRazorpaySignature({
      orderId: testOrderId,
      paymentId: testPaymentId,
      signature: 'invalid_signature',
    });
    console.log('Invalid signature test result (should be false):', isBadMatch);

    console.log('All controller imports and Razorpay services verified successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

testAll();
