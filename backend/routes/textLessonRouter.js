import express from 'express';
import {
    createTextLesson,
    getAllTextLessons,
    getTextLessonById,
    updateTextLesson,
    deleteTextLesson
} from '../controllers/textLessonController.js';
import { upload } from '../middlewares/upload-middleware.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isContentManager as isAdmin } from '../middlewares/isAdmin.js';

const Textrouter = express.Router();

// Create a new text lesson (admin only)
Textrouter.post(
    '/',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    upload.any(),
    createTextLesson
);

// Get all text lessons (admin/instructor only)
Textrouter.get(
    '/',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    getAllTextLessons
);

// Get a single text lesson by ID (authenticated)
Textrouter.get(
    '/:id',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    getTextLessonById
);

// Update a text lesson (admin only)
Textrouter.put(
    '/:id',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    upload.any(),
    updateTextLesson
);

// Delete a text lesson (admin only)
Textrouter.delete(
    '/:id',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    deleteTextLesson
);

export default Textrouter;