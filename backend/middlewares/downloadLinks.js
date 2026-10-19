import jwt from 'jsonwebtoken';
import passport from 'passport';

// Browsers cannot attach Bearer headers to video/attachment URLs. Mint a
// path-scoped link; the download still checks current user and entitlement.
function downloadLinks(req, res, next) {
  // Editors may round-trip response objects. Never persist expiring link tokens.
  const clean = value => {
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      if (['filePath', 'fileUrl'].includes(key) && typeof item === 'string' && item.includes('uploads/')) {
        value[key] = item.replace(/[?&]downloadToken=[^&]*/g, '');
      } else clean(item);
    }
  };
  clean(req.body);
  const original = res.json.bind(res);
  res.json = body => {
    if (!req.user) return original(body);
    const userId = String(req.user._id);
    const secret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY || process.env.JWT_ACCESS_SECRET;
    if (!secret) return original(body);
    const clone = JSON.parse(JSON.stringify(body));
    const visit = value => {
      if (!value || typeof value !== 'object') return;
      for (const [key, item] of Object.entries(value)) {
        if (['filePath', 'fileUrl'].includes(key) && typeof item === 'string') {
          const normalized = item.replaceAll('\\', '/');
          const index = normalized.indexOf('uploads/');
          if (index >= 0) {
            const resource = normalized.slice(index + 8).split('?')[0];
            const token = jwt.sign({ purpose: 'download', userId, resource, sessionVersion: req.user.sessionVersion || 0 }, secret, { algorithm: 'HS256', expiresIn: '8h' });
            value[key] = normalized.split('?')[0] + '?downloadToken=' + token;
          }
        } else visit(item);
      }
    };
    visit(clone);
    return original(clone);
  };
  if (!req.headers.authorization && !req.cookies?.accessToken) return next();
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) req.user = user;
    next();
  })(req, res, next);
}
export default downloadLinks;
