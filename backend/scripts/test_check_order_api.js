import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Course from '../models/Course.js';
import Setting from '../models/setting.js';
import { getRazorpayInstance, getRazorpayKeys } from '../config/razorpay.js';

async function testCheckOrderFlow() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Find any published course
    const course = await Course.findOne({ isPublished: true, isDeleted: false });
    if (!course) {
      console.log('No published course found in DB');
      process.exit(0);
    }
    console.log('Found course for testing:', course._id.toString(), course.title, 'Price:', course.price, 'SalePrice:', course.salePrice);

    const razorpay = await getRazorpayInstance();
    const { keyId } = await getRazorpayKeys();

    const price = course.salePrice && parseFloat(course.salePrice) > 0
      ? parseFloat(course.salePrice)
      : parseFloat(course.price || 0);

    const GST_RATE = await Setting.getGstRate();
    const tax = parseFloat((price * GST_RATE).toFixed(2));
    const total = parseFloat((price + tax).toFixed(2));

    const orderOptions = {
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `test_${Date.now()}`,
      notes: { courseId: course._id.toString() }
    };

    const order = await razorpay.orders.create(orderOptions);
    console.log('Successfully created real Razorpay live order:', order.id, 'Amount (paise):', order.amount, 'Status:', order.status);

    console.log('Payload that frontend receives:');
    console.log({
      success: true,
      is_valid: true,
      razorpay: {
        key: keyId,
        order: { id: order.id, amount: order.amount, currency: order.currency },
        amount: total,
        currency: 'INR'
      }
    });

    console.log('Test Check Order Flow PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('Test Check Order Flow failed:', err);
    process.exit(1);
  }
}

testCheckOrderFlow();
