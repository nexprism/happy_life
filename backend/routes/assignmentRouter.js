import express from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { upload } from '../middlewares/upload-middleware.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isContentManager as isAdmin } from '../middlewares/isAdmin.js';

const assignmentRouter = express.Router();

// Create assignment (admin/instructor only)
assignmentRouter.post(
  '/',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  upload.fields([
    { name: 'attachmentFile', maxCount: 1 },
    { name: 'documentFile', maxCount: 1 }
  ]),
  createAssignment
);

// Get all assignments (admin/instructor only)
assignmentRouter.get(
  '/',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  getAllAssignments
);

// Get assignment by ID (authenticated)
assignmentRouter.get(
  '/:id',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  getAssignmentById
);

// Update assignment (admin/instructor only)
assignmentRouter.put(
  '/:id',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  upload.fields([
    { name: 'attachmentFile', maxCount: 1 },
    { name: 'documentFile', maxCount: 1 }
  ]),
  updateAssignment
);

// Delete assignment (admin/instructor only)
assignmentRouter.delete(
  '/:id',
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
  isAdmin,
  deleteAssignment
);

export default assignmentRouter;