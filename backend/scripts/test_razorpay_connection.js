import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { getRazorpayKeys, getRazorpayInstance, verifyRazorpaySignature } from '../config/razorpay.js';

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const keys = await getRazorpayKeys();
    console.log('Resolved Razorpay Key ID:', keys.keyId);
    console.log('Resolved Razorpay Key Secret is present:', !!keys.keySecret);

    const rzp = await getRazorpayInstance();
    console.log('Razorpay instance created successfully:', !!rzp.orders);

    // Test creating a dummy order
    const dummyOrder = await rzp.orders.create({
      amount: 100, // 1 INR in paise
      currency: 'INR',
      receipt: `test_receipt_${Date.now()}`,
      notes: { test: 'Live key validation test' }
    });
    console.log('Successfully created test order with Razorpay Live API:', dummyOrder.id, dummyOrder.status);

    process.exit(0);
  } catch (err) {
    console.error('Razorpay test failed:', err);
    process.exit(1);
  }
}

testConnection();
