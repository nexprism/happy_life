import AssignmentSubmissionService from '../service/assignmentSubmissionService.js';
import VideoSessionRepository from '../repository/VideoSessionRepository.js';
import { getGlobalLeaderboard, getUserLeaderboard } from '../service/leaderboardService.js';
import User from '../models/user.js';
import Course from '../models/Course.js';
import CourseEnrollment from '../models/CourseEnrollment.js';
import Certificate from '../models/Certificate.js';
import Leaderboard from '../models/Leaderboard.js';
import News from '../models/News.js';
import Assignment from '../models/Assignment.js';
import LessonProgress from '../models/LessonProgress.js';
import QuizSubmission from '../models/QuizSubmission.js';
import AssignmentSubmission from '../models/assignmentSubmission.js';
import CourseBundle from '../models/CourseBundle.js';
import CoursePlan from '../models/CoursePlan.js';
import mongoose from 'mongoose';

const assignmentService = new AssignmentSubmissionService();

const getLevelFromXPValue = (xp) => {
  if (xp >= 5000) return 'Expert';
  if (xp >= 1500) return 'Advanced';
  if (xp >= 500) return 'Intermediate';
  return 'Beginner';
};

class DashboardController {
  async getDashboard(req, res) {
    try {
      const rawUserId = req.user?._id || req.user?.id;
      if (!rawUserId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const userId = new mongoose.Types.ObjectId(String(rawUserId));

      // 1. Fetch User and Base Collections in parallel
      const [user, enrollments, news, leaderboardData, certificatesCount] = await Promise.all([
        User.findById(userId).select('fullName email profilePicture role bio phone location company address education skills mobileVerified emailVerified').lean(),
        CourseEnrollment.find({ userId, isWithdrawn: false })
          .populate('courseId', 'title thumbnail difficulty slug description modules isPublished')
          .populate('courseBundleId')
          .populate('coursePlanId')
          .lean(),
        News.find({ status: 'active' }).sort({ publishedAt: -1 }).limit(5).select('title summary publishedAt imageUrl').lean(),
        Leaderboard.findOne({ userId }).lean(),
        Certificate.countDocuments({ user_id: userId, status: 'issued' })
      ]);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // 2. Resolve all enrolled courses (Direct, Plan, Bundle)
      const courseMap = new Map();
      const enrollmentMap = new Map();

      for (const enrollment of enrollments) {
        if (enrollment.type === 'course' && enrollment.courseId) {
          const c = enrollment.courseId;
          const cidStr = c._id.toString();
          courseMap.set(cidStr, c);
          enrollmentMap.set(cidStr, enrollment);
        } else if (enrollment.type === 'coursePlan' && enrollment.coursePlanId) {
          const plan = enrollment.coursePlanId;
          if (plan.courseId) {
            const cidStr = plan.courseId.toString();
            enrollmentMap.set(cidStr, enrollment);
          }
        } else if (enrollment.type === 'courseBundle' && enrollment.courseBundleId) {
          const bundle = enrollment.courseBundleId;
          const bundleCourses = bundle.courses || [];
          for (const bc of bundleCourses) {
            const cidStr = bc.toString();
            enrollmentMap.set(cidStr, enrollment);
          }
        }
      }

      // Fetch missing full course objects with populated modules & lessons
      const enrolledCourseIds = Array.from(new Set([
        ...Array.from(courseMap.keys()),
        ...Array.from(enrollmentMap.keys())
      ]));

      const fullCourses = enrolledCourseIds.length > 0
        ? await Course.find({ _id: { $in: enrolledCourseIds } })
            .select('title thumbnail difficulty slug description modules isPublished')
            .populate({
              path: 'modules',
              populate: { path: 'lessons', select: 'title type duration fileUrl ismobileOnly isRequired' }
            })
            .lean()
        : [];

      for (const fc of fullCourses) {
        courseMap.set(fc._id.toString(), fc);
      }

      // 3. Batch fetch completed items for this user across all enrolled courses
      const courseObjectIds = enrolledCourseIds.map(id => new mongoose.Types.ObjectId(id));

      const [completedLessonsDocs, passedQuizzesDocs, gradedAssignmentsDocs] = await Promise.all([
        courseObjectIds.length > 0
          ? LessonProgress.find({ userId, courseId: { $in: courseObjectIds }, completed: true }).lean()
          : [],
        courseObjectIds.length > 0
          ? QuizSubmission.find({ user: userId, courseId: { $in: courseObjectIds }, is_completed: true, passed: true }).lean()
          : [],
        courseObjectIds.length > 0
          ? AssignmentSubmission.find({ submittedBy: userId, courseId: { $in: courseObjectIds }, is_complete: true, status: 'graded' }).lean()
          : []
      ]);

      const completedLessonsByCourse = new Map();
      completedLessonsDocs.forEach(lp => {
        const cid = lp.courseId?.toString();
        if (cid) {
          const set = completedLessonsByCourse.get(cid) || new Set();
          set.add(lp.lessonId?.toString());
          completedLessonsByCourse.set(cid, set);
        }
      });

      const passedQuizzesByCourse = new Map();
      passedQuizzesDocs.forEach(qs => {
        const cid = qs.courseId?.toString();
        if (cid) {
          const set = passedQuizzesByCourse.get(cid) || new Set();
          set.add((qs.quiz || qs.lessonId || qs._id)?.toString());
          passedQuizzesByCourse.set(cid, set);
        }
      });

      const gradedAssignmentsByCourse = new Map();
      gradedAssignmentsDocs.forEach(as => {
        const cid = as.courseId?.toString();
        if (cid) {
          const set = gradedAssignmentsByCourse.get(cid) || new Set();
          set.add((as.assignmentId || as.lessonId || as._id)?.toString());
          gradedAssignmentsByCourse.set(cid, set);
        }
      });

      // 4. Calculate dynamic progress per course
      const activeCourses = [];
      let totalCompletedCourses = 0;

      for (const cidStr of enrolledCourseIds) {
        const course = courseMap.get(cidStr);
        if (!course) continue;

        const enrollment = enrollmentMap.get(cidStr);
        let totalItems = 0;

        if (course.modules && Array.isArray(course.modules)) {
          for (const mod of course.modules) {
            if (mod && Array.isArray(mod.lessons)) {
              for (const l of mod.lessons) {
                if (['video', 'video-lesson', 'text', 'quiz', 'assignment', 'external_link'].includes(l.type) || l.type) {
                  totalItems++;
                }
              }
            }
          }
        }

        const compLessonsCount = (completedLessonsByCourse.get(cidStr) || new Set()).size;
        const compQuizzesCount = (passedQuizzesByCourse.get(cidStr) || new Set()).size;
        const compAssignmentsCount = (gradedAssignmentsByCourse.get(cidStr) || new Set()).size;
        const totalCompletedItems = compLessonsCount + compQuizzesCount + compAssignmentsCount;

        const dynamicProgress = totalItems > 0
          ? Math.min(100, Math.round((totalCompletedItems / totalItems) * 100))
          : (enrollment?.progressPercentage || 0);

        const iscompleted = dynamicProgress >= 100 || enrollment?.iscompleted || false;
        if (iscompleted) totalCompletedCourses++;

        // Lazy update CourseEnrollment progress if changed
        if (enrollment && (enrollment.progressPercentage !== dynamicProgress || enrollment.iscompleted !== iscompleted)) {
          CourseEnrollment.updateOne(
            { _id: enrollment._id },
            { $set: { progressPercentage: dynamicProgress, iscompleted: iscompleted } }
          ).exec().catch(() => {});
        }

        activeCourses.push({
          courseId: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          difficulty: course.difficulty || 'Medium',
          progress: dynamicProgress,
          iscompleted,
          status: enrollment?.status || 'active',
          enrolledAt: enrollment?.enrolledAt || course.createdAt
        });
      }

      // 5. Calculate Total Completed Lessons & Live XP
      const totalCompletedLessonsCount = await LessonProgress.countDocuments({ userId, completed: true });
      const totalCompletedQuizzesCount = await QuizSubmission.countDocuments({ user: userId, is_completed: true, passed: true });
      const totalCompletedAssignmentsCount = await AssignmentSubmission.countDocuments({ submittedBy: userId, is_complete: true, status: 'graded' });

      const calculatedXP = (totalCompletedLessonsCount * 15) + (totalCompletedQuizzesCount * 25) + (totalCompletedAssignmentsCount * 40) + 10;
      const userXP = Math.max(leaderboardData?.xp || 0, calculatedXP);
      const userLevel = getLevelFromXPValue(userXP);

      // Keep Leaderboard synchronized
      Leaderboard.findOneAndUpdate(
        { userId },
        { $set: { xp: userXP, level: userLevel, lastUpdated: new Date() } },
        { upsert: true }
      ).exec().catch(() => {});

      // 6. Submissions & Pending Assignments
      const submissions = await assignmentService.getMySubmissions(userId).catch(() => []);
      const recentSubmissions = (submissions || [])
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5)
        .map(s => ({
          id: s._id,
          assignmentTitle: s.assignmentId?.title || s.assignmentTitle || 'Assignment',
          courseTitle: s.courseId?.title || s.courseTitle || '',
          status: s.status,
          submittedAt: s.submittedAt
        }));

      const allAssignments = courseObjectIds.length > 0
        ? await Assignment.find({ courseId: { $in: courseObjectIds } }).limit(10).lean()
        : [];
      const submittedAssignmentIds = submissions.map(s => s.assignmentId?._id?.toString() || s.assignmentId?.toString() || '');
      
      const upcomingAssignments = allAssignments
        .filter(a => !submittedAssignmentIds.includes(a._id.toString()))
        .slice(0, 5)
        .map(a => ({
          id: a._id,
          title: a.title,
          courseId: a.courseId
        }));

      // 7. Continue Learning: Fetch from recent LessonProgress & VideoSessions
      const [recentProgressDocs, recentVideoSessions] = await Promise.all([
        LessonProgress.find({ userId })
          .populate('lessonId', 'title type duration fileUrl')
          .populate('courseId', 'title thumbnail')
          .sort({ lastUpdatedAt: -1 })
          .limit(5)
          .lean(),
        VideoSessionRepository.find({ userId }).catch(() => [])
      ]);

      let recentSessions = [];

      if (recentProgressDocs && recentProgressDocs.length > 0) {
        recentSessions = recentProgressDocs.map(lp => ({
          sessionId: lp.sessionId || lp._id,
          videoTitle: lp.lessonId?.title || lp.courseId?.title || 'Lesson',
          lessonTitle: lp.lessonId?.title || '',
          courseId: lp.courseId?._id || lp.courseId,
          courseTitle: lp.courseId?.title || '',
          thumbnail: lp.courseId?.thumbnail || '',
          lastWatchedAt: lp.lastUpdatedAt || lp.updatedAt,
          completionPercentage: lp.progressPercentage || lp.completionPercentage || 0
        }));
      } else if (recentVideoSessions && recentVideoSessions.length > 0) {
        recentSessions = recentVideoSessions
          .sort((a, b) => new Date(b.updatedAt || b.startTime) - new Date(a.updatedAt || a.startTime))
          .slice(0, 5)
          .map(s => ({
            sessionId: s.sessionId,
            videoTitle: s.videoId?.title || '',
            lessonTitle: s.lessonId?.title || '',
            courseId: s.courseId,
            lastWatchedAt: s.updatedAt || s.endTime || s.startTime,
            completionPercentage: s.completionPercentage || 0
          }));
      } else if (activeCourses.length > 0) {
        // Fallback to first enrolled course
        const firstCourse = activeCourses[0];
        recentSessions = [{
          sessionId: `starter_${firstCourse.courseId}`,
          videoTitle: firstCourse.title,
          lessonTitle: 'Introduction',
          courseId: firstCourse.courseId,
          courseTitle: firstCourse.title,
          thumbnail: firstCourse.thumbnail,
          lastWatchedAt: new Date(),
          completionPercentage: firstCourse.progress || 0
        }];
      }

      // 8. Top learners & User Leaderboard Rank
      let topLearners = await getGlobalLeaderboard(5).catch(() => []);
      if (!topLearners || topLearners.length === 0) {
        // Fallback mock top learners if database is fresh
        topLearners = [
          { userId: { _id: user._id, fullName: user.fullName || 'You' }, xp: userXP },
        ];
      }

      let userRank = null;
      try {
        userRank = await getUserLeaderboard(userId);
      } catch (e) {
        userRank = { rank: 1, xp: userXP, level: userLevel };
      }

      res.json({
        success: true,
        data: {
          allCoursesCount: activeCourses.length,
          activeCoursesCount: activeCourses.filter(c => !c.iscompleted).length,
          completedCoursesCount: totalCompletedCourses,
          certificatesCount: certificatesCount,
          profile: {
            ...user,
            stats: {
              enrolledCourses: activeCourses.length,
              activeCourses: activeCourses.filter(c => !c.iscompleted).length,
              completedCourses: totalCompletedCourses,
              completedLessons: totalCompletedLessonsCount,
              completedModules: totalCompletedLessonsCount,
              certificatesEarned: certificatesCount,
              xp: userXP,
              level: userLevel,
              rank: userRank?.rank || 1
            }
          },
          activeCourses,
          continueLearning: recentSessions,
          upcomingAssignments,
          recentSubmissions,
          recentNews: news,
          topLearners,
          leaderboard: userRank
        }
      });

    } catch (err) {
      console.error('Dashboard Error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new DashboardController();



