import path from 'path';
import passport from 'passport';
import File from '../models/File.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import { canReadCourse } from '../utils/courseAccess.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Retain existing URLs and public assets; enforce authorization for protected records.
async function protectedUploads(req, res, next) {
  try {
    let relative;
    try { relative = decodeURIComponent(req.path).replace(/^\/+/, ''); }
    catch { return res.sendStatus(400); }
    const paths = [`uploads/${relative}`, `/uploads/${relative}`, `uploads\\${relative.replaceAll('/', '\\')}`, path.resolve('uploads', relative)];
    const files = await File.find({ filePath: { $in: paths }, isPublic: { $ne: true } }).select('courseId').lean();
    const lessons = await Lesson.find({ fileUrl: { $in: paths }, accessibility: 'paid' }).select('moduleId').lean();
    if (!files.length && !lessons.length) return next();
    const authorize = async (err, user) => {
      try {
        if (err) return next(err);
        if (!user) return res.sendStatus(401);
        if (user.isBanned || user.isActive === false || user.status === 'inactive') return res.sendStatus(403);
        const modules = await Module.find({ _id: { $in: lessons.map(l => l.moduleId) } }).select('courseId').lean();
        const courses = [...files.map(f => f.courseId), ...modules.map(m => m.courseId)];
        if (!courses.length) return res.sendStatus(403);
        for (const courseId of courses) if (!await canReadCourse(user, courseId)) return res.sendStatus(403);
        res.setHeader('Cache-Control', 'private, no-store');
        next();
      } catch (error) { next(error); }
    };
    if (req.query.downloadToken) {
      try {
        const payload = jwt.verify(req.query.downloadToken, process.env.JWT_ACCESS_TOKEN_SECRET_KEY || process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
        if (payload.purpose !== 'download' || payload.resource !== relative) return res.sendStatus(403);
        const user = await User.findById(payload.userId).select('role isBanned isActive status passwordChangedAt sessionVersion').lean();
        if ((user?.sessionVersion || 0) !== (payload.sessionVersion || 0)) return res.sendStatus(401);
        if (user?.passwordChangedAt && payload.iat < Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)) return res.sendStatus(401);
        return authorize(null, user);
      } catch { return res.sendStatus(401); }
    }
    passport.authenticate('jwt', { session: false }, authorize)(req, res, next);
  } catch (error) { next(error); }
}
export default protectedUploads;
