import mongoose from 'mongoose';
import xlsx from 'xlsx';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ishagohel181:JHf4FanNi8VCBZz0@cluster0.pmyvsgz.mongodb.net/happy_life?retryWrites=true&w=majority&appName=Cluster0';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const User = (await import('../models/user.js')).default;
  const Course = (await import('../models/Course.js')).default;
  const CoursePlan = (await import('../models/CoursePlan.js')).default;
  const CourseEnrollment = (await import('../models/CourseEnrollment.js')).default;
  const CourseChatRoom = (await import('../models/CourseChatRoom.js')).default;

  const excelPath = path.resolve(__dirname, '../../students_astro_foundation_old.xlsx');
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log(`📊 Processing ${rows.length} rows from Excel...`);

  const course = await Course.findOne({ title: /Astro Foundation Course old/i });
  if (!course) {
    console.error('❌ Course "Astro Foundation Course old" not found!');
    process.exit(1);
  }
  console.log(`🎯 Found Target Course: "${course.title}" (_id: ${course._id})`);

  const plan = await CoursePlan.findOne({ courseId: course._id, status: 'active' }) ||
               await CoursePlan.findOne({ courseId: course._id });
  console.log(`📦 Course Plan: ${plan ? plan.name + ' (' + plan.duration + ' ' + plan.durationType + ')' : 'None (defaulting to 1 year)'}`);

  let accessExpiry = new Date();
  if (plan && plan.duration && plan.durationType) {
    const durType = plan.durationType.toLowerCase();
    const dur = Number(plan.duration) || 1;
    if (durType.includes('year')) accessExpiry.setFullYear(accessExpiry.getFullYear() + dur);
    else if (durType.includes('month')) accessExpiry.setMonth(accessExpiry.getMonth() + dur);
    else if (durType.includes('day')) accessExpiry.setDate(accessExpiry.getDate() + dur);
    else accessExpiry.setFullYear(accessExpiry.getFullYear() + 1);
  } else {
    accessExpiry.setFullYear(accessExpiry.getFullYear() + 1);
  }

  const results = { created: 0, existingUser: 0, enrolled: 0, alreadyActive: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = (row['Name'] || '').toString().trim();
    const email = (row['Email'] || '').toString().trim().toLowerCase();
    const phone = (row['Phone'] || '').toString().trim();
    const password = (row['Password'] || 'happylife@123').toString().trim();

    if (!email || !email.includes('@')) {
      results.errors.push({ row: i + 2, reason: 'Invalid email' });
      continue;
    }

    try {
      let user = await User.findOne({ email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
          fullName: name || 'Student',
          email,
          password: hashedPassword,
          phone: phone || undefined,
          role: 'student',
          is_verify: true,
          emailVerified: true,
          isActive: true
        });
        results.created++;
      } else {
        results.existingUser++;
      }

      const existingEnrollment = await CourseEnrollment.findOne({ userId: user._id, courseId: course._id });
      if (existingEnrollment) {
        const isExpired = existingEnrollment.accessExpiry && existingEnrollment.accessExpiry < new Date();
        if (existingEnrollment.status === 'active' && !isExpired) {
          results.alreadyActive++;
        } else {
          await CourseEnrollment.findByIdAndUpdate(existingEnrollment._id, {
            status: 'active',
            enrolledAt: new Date(),
            accessType: 'limited',
            accessExpiry,
            coursePlanId: plan?._id || existingEnrollment.coursePlanId,
            enrollmentSource: 'import'
          });
          results.enrolled++;
        }
      } else {
        await CourseEnrollment.create({
          userId: user._id,
          courseId: course._id,
          coursePlanId: plan?._id || undefined,
          type: plan ? 'coursePlan' : 'course',
          status: 'active',
          accessType: 'limited',
          accessExpiry,
          enrollmentSource: 'import',
          enrolledAt: new Date()
        });

        await Course.findByIdAndUpdate(course._id, {
          $addToSet: { enrolledStudents: user._id },
          $inc: { enrolledStudentsCount: 1 }
        });

        await User.findByIdAndUpdate(user._id, {
          $addToSet: { enrolledCourses: course._id }
        });

        results.enrolled++;
      }

      // Chat room
      try {
        const chatRoom = await CourseChatRoom.findOne({ courseId: course._id });
        if (chatRoom && !chatRoom.participants.map(String).includes(String(user._id))) {
          chatRoom.participants.push(user._id);
          await chatRoom.save();
        }
      } catch (_) {}

    } catch (err) {
      results.errors.push({ row: i + 2, email, reason: err.message });
    }
  }

  console.log('🎉 Execution Completed!');
  console.log(JSON.stringify(results, null, 2));

  // Invalidate Redis
  try {
    const { initRedis } = await import('../config/redisClient.js');
    const redis = await initRedis();
    await redis.del('enrollments:all*');
    console.log('🔄 Redis cache cleared');
  } catch (_) {}

  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
