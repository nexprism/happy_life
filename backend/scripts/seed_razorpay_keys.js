import mongoose from 'mongoose';
import Setting from '../models/setting.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedRazorpay() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const keySetting = await Setting.findOneAndUpdate(
      { key: 'RAZORPAY_KEY_ID' },
      {
        key: 'RAZORPAY_KEY_ID',
        value: 'rzp_live_TlK2ykdULLIce2',
        description: 'Razorpay Key ID (Live)'
      },
      { upsert: true, new: true }
    );
    console.log('Updated/Created RAZORPAY_KEY_ID:', keySetting);

    const secretSetting = await Setting.findOneAndUpdate(
      { key: 'RAZORPAY_KEY_SECRET' },
      {
        key: 'RAZORPAY_KEY_SECRET',
        value: '9QgRBBSlohuBFT0LXSu38FuD',
        description: 'Razorpay Key Secret (Live)'
      },
      { upsert: true, new: true }
    );
    console.log('Updated/Created RAZORPAY_KEY_SECRET:', secretSetting);

    console.log('Razorpay keys seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed Razorpay keys:', err);
    process.exit(1);
  }
}

seedRazorpay();
