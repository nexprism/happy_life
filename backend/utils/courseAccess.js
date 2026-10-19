import Enrollment from '../models/Enrollment.js';
import CourseEnrollment from '../models/CourseEnrollment.js';

export const canReadCourse = async (user, courseId) => {
  if (!user || !courseId) return false;
  if (['admin', 'super_admin', 'instructor'].includes(user.role)) return true;
  const now = new Date();
  return Boolean(await CourseEnrollment.exists({ userId: user._id, courseId, status: 'active',
    $or: [{ accessExpiry: null }, { accessExpiry: { $gt: now } }] }) ||
    await Enrollment.exists({ userId: user._id, courseId, isActive: true,
      $or: [{ accessEnd: null }, { accessEnd: { $gt: now } }] }));
};
