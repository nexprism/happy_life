import express from 'express';
import passport from 'passport';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';

import {
  getLessonProgress,
  updateLessonProgress,
  completeLessonProgress,
  getCourseProgress,
  getUserProgressOverview,
  initializeLessonProgress,
  resetLessonProgress,
  getCourseLessonsStatus
} from '../controllers/ProgressController.js';

const router = express.Router();

// Routes
router.get('/overview',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  getUserProgressOverview
);

router.get('/courses/:courseId/lessons/:lessonId/progress',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  getLessonProgress
);

router.patch('/courses/:courseId/lessons/:lessonId/progress',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  updateLessonProgress
);

router.put('/courses/:courseId/lessons/:lessonId/progress',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  updateLessonProgress
);

router.post('/:courseId/:lessonId/complete',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  completeLessonProgress
);

router.get('/:courseId/progress',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  getCourseProgress
);

router.post('/:courseId/:lessonId/initialize',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  initializeLessonProgress
);

router.delete('/:courseId/:lessonId/reset',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  resetLessonProgress
);

// IDOR protection: only self or admin can check lessons status
router.get('/api/course-status/:courseId/:userId',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    const requesterId = req.user?._id?.toString();
    const targetUserId = req.params.userId;
    const role = req.user?.role;
    if (requesterId === targetUserId || role === 'admin' || role === 'super_admin') {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied: unauthorized access to other user progress' });
  },
  getCourseLessonsStatus
);

export default router;
