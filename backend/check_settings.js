import mongoose from 'mongoose';
import Setting from './models/setting.js';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const settings = await Setting.find({});
console.log('Settings in DB:', settings);
process.exit(0);
