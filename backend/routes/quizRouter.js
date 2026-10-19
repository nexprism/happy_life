import express from 'express';
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  mySubmittedQuizzes,
  submittedQuiz,
  getAllSubmissions,
  startQuiz,
  getQuizLeaderboard
} from '../controllers/QuizController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isContentManager as isAdmin } from '../middlewares/isAdmin.js';
import { upload } from '../middlewares/upload-middleware.js';

const quizRouter = express.Router();

// Optional authentication preserves public quizzes and the authenticated editor.
const optionalAuth = (req, res, next) => passport.authenticate('jwt', { session: false }, (err, user) => {
  if (err) return next(err);
  if (user) req.user = user;
  next();
})(req, res, next);
quizRouter.get('/', optionalAuth, getAllQuizzes);
quizRouter.get('/:quizId', optionalAuth, getQuizById);
quizRouter.get('/my/submitted-quizzes',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  mySubmittedQuizzes
);
quizRouter.get('/submitted-quiz/:submissionId',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  submittedQuiz
);

quizRouter.get('/all/submissions',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  getAllSubmissions
);

quizRouter.get('/leaderboard/:courseId/:quizId',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  getQuizLeaderboard
);

quizRouter.post(
  '/',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  createQuiz
);

quizRouter.post(
  '/bulk-upload',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  upload.single('file'),
  (req, res, next) => {
    import('../controllers/QuizController.js')
      .then(module => module.bulkUploadQuizQuestions(req, res, next))
      .catch(next);
  }
);

quizRouter.post(
  '/:quizId/submit',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  submitQuiz
);

quizRouter.post(
  '/start',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  startQuiz
);

quizRouter.put(
  '/:quizId',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  upload.any(),
  updateQuiz
);

quizRouter.delete(
  '/:quizId',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  deleteQuiz
);

export default quizRouter;
