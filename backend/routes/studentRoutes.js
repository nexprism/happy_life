// routes/studentRoutes.js
import express from 'express';
import passport from 'passport';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { getAllStudents, getStudentById, getStudentAnalytics, updateStudentByAdmin } from '../controllers/studentController.js';
import { deleteUser } from '../controllers/userController.js';

const studentRouter = express.Router();

studentRouter.get(
  '/',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  getAllStudents
);

studentRouter.get(
  '/:id',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  getStudentById
);

studentRouter.put(
  '/:id',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  updateStudentByAdmin
);

studentRouter.get(
  '/:id/analytics',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  getStudentAnalytics
);

studentRouter.delete(
  '/:id',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  deleteUser
);

export default studentRouter;
