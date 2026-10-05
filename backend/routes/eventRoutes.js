import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  checkRegisterForEvent,
  registerForEvent,
  updateParticipantStatus
} from '../controllers/EventController.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isAdmin } from '../middlewares/isAdmin.js';
import { upload } from '../middlewares/upload-middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Optional auth helper: populates req.user if token is present, but allows guest submissions
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.accessToken;
  if (token) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (user) req.user = user;
      next();
    })(req, res, next);
  } else {
    next();
  }
};

// Registration routes (supports logged in users and guests)
router.post('/:id/check-register', optionalAuth, checkRegisterForEvent);
router.post('/:id/register', optionalAuth, registerForEvent);

// Protected routes
router.use(accessTokenAutoRefresh);
router.use(passport.authenticate('jwt', { session: false }));

// Event creation and management (admin only)
router.post('/',
  isAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]),
  createEvent
);

router.put('/:id',
  isAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'attachments', maxCount: 5 }
  ]),
  updateEvent
);

router.delete('/:id', isAdmin, deleteEvent);

// Participant management
router.patch('/:id/participants/:userId/status', isAdmin, updateParticipantStatus);

export default router;
