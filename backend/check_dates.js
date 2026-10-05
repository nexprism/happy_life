import mongoose from 'mongoose';
import Event from './models/Event.js';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const event = await Event.findById('6ac2cc4d6dae027c111af920');
console.log('Event dates:');
console.log('startDate:', event.startDate, 'parsed:', new Date(event.startDate));
console.log('endDate:', event.endDate, 'parsed:', new Date(event.endDate));
console.log('now:', new Date());
console.log('startDate < now:', new Date(event.startDate) < new Date());
console.log('endDate < now:', new Date(event.endDate) < new Date());
process.exit(0);
