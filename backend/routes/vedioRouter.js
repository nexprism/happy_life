import express from 'express';
import passport from 'passport';
import videoLessonController from '../controllers/videoLessonController.js';
import path from 'path';
import fs from 'fs';
import vedioCypherService from '../service/platforms/videoCypherService.js';

import {upload} from '../middlewares/upload-middleware.js';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import { isContentManager as isAdmin } from '../middlewares/isAdmin.js';


const VedioRouter = express.Router();

// Auth middleware chains
const requireAuth = [
  accessTokenAutoRefresh,
  passport.authenticate('jwt', { session: false }),
];
const requireAdmin = [...requireAuth, isAdmin];


// Create video lesson with file upload
VedioRouter.post('/', ...requireAdmin, upload.single('video'), videoLessonController.createVideoLesson);

// Add to your routes
VedioRouter.get('/test-videocypher', ...requireAdmin, async (req, res) => {
  try {
    
    const isValid = await vedioCypherService.validateApiKey();
    res.json({ 
      valid: isValid,
      apiKeySet: !!process.env.VIDEOCYPHER_API_KEY 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all video lessons
VedioRouter.get('/', ...requireAdmin, videoLessonController.getAllVideoLessons);

// Video streaming endpoint for manual uploads
VedioRouter.get('/stream/:filename', ...requireAuth, (req, res) => {
  const safeName = path.basename(req.params.filename);
  if (
    safeName !== req.params.filename ||
    safeName.includes('..') ||
    safeName.includes('/') ||
    safeName.includes('\\')
  ) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const videoDir = path.resolve(process.env.MANUAL_UPLOAD_PATH || 'uploads/videos');
  const filePath = path.join(videoDir, safeName);

  if (filePath !== videoDir && !filePath.startsWith(videoDir + path.sep)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  if (typeof fs !== 'undefined' && fs?.existsSync) {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers?.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).set("Content-Range", `bytes */${fileSize}`).end();
        return;
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } else {
    res.status(200).json({ message: 'Streaming handler ready' });
  }
});

// Thumbnail endpoint for manual uploads
VedioRouter.get('/thumbnail/:filename', ...requireAuth, (req, res) => {
  const safeName = path.basename(req.params.filename);
  if (
    safeName !== req.params.filename ||
    safeName.includes('..') ||
    safeName.includes('/') ||
    safeName.includes('\\')
  ) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const thumbsRoot = path.resolve(process.env.MANUAL_UPLOAD_PATH || 'uploads/videos', 'thumbnails');
  const resolved = path.resolve(thumbsRoot, safeName);
  if (resolved !== thumbsRoot && !resolved.startsWith(thumbsRoot + path.sep)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  if (fs.existsSync(resolved)) {
    res.sendFile(resolved);
  } else {
    res.status(404).json({ error: 'Thumbnail not found' });
  }
});

// Get video lesson by ID
VedioRouter.get('/:id', ...requireAdmin, videoLessonController.getVideoLesson);

// Get video lessons by lesson ID
VedioRouter.get('/lesson/:lessonId', ...requireAdmin, videoLessonController.getVideoLessonsByLesson);

// Get video lessons by platform
VedioRouter.get('/platform/:platform', ...requireAdmin, videoLessonController.getVideoLessonsByPlatform);

// Get video lessons by status
VedioRouter.get('/status/:status', ...requireAdmin, videoLessonController.getVideoLessonsByStatus);

// Update video lesson
VedioRouter.put('/:id', ...requireAdmin, upload.single('video'), videoLessonController.updateVideoLesson);

// Update video status
VedioRouter.patch('/:id/status', ...requireAdmin, videoLessonController.updateVideoStatus);

// Delete video lesson
VedioRouter.delete('/:id', ...requireAdmin, videoLessonController.deleteVideoLesson);

export default VedioRouter;
