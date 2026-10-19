import express from "express";
import multer from "multer";
import {
  createNews,
  getAllNews,
  getNewsById,
  getNewsBySlug,
  updateNews,
  deleteNews,
  searchNews,
  incrementNewsStats,
  likeNews,
  unlikeNews,
  toggleLike,
  viewNews,
  shareNews,
  getUsersWhoViewed,
  getUsersWhoLiked,
  getUsersWhoShared,
  checkUserInteractionStatus,
  uploadContentVideo,
  uploadEditorImage,
  uploadContentImage, // Restored missing import
  getAllCategories,
  addComment,
  addReply,
  deleteComment,
  getComments,
  fetchWordPressNews,
} from "../controllers/newsController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";
import { isAdmin } from "../middlewares/isAdmin.js";
import newsUpload from "../middlewares/newsUpload.js";
import contentImageUpload from "../middlewares/contentImageUpload.js";
import contentVideoUpload from "../middlewares/contentVideoUpload.js";
import { combinedUpload } from "../middlewares/combinedNewsUpload.js";
import NewsService from "../service/newsService.js"


const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllNews); // GET /news - Get all news with filters
router.get("/all/categories", getAllCategories);
router.get("/search", searchNews); // GET /news/search?q=query - Search news
router.get("/slug/:slug", getNewsBySlug); // GET /news/slug/:slug - Get news by slug
router.get("/:id", getNewsById); // GET /news/:id - Get news by ID
router.get("/:id/comments", getComments); // GET /news/:id/comments - Get comments for news
router.patch("/:id/stats", incrementNewsStats); // PATCH /news/:id/stats - Increment views/likes/shares (tracks user if authenticated)

// Admin-only routes to get user interaction lists (user privacy protection)
router.get("/:id/users/viewed", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), isAdmin, getUsersWhoViewed);
router.get("/:id/users/liked", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), isAdmin, getUsersWhoLiked);
router.get("/:id/users/shared", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), isAdmin, getUsersWhoShared);

router.post("/fetch-wordpress", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), isAdmin, fetchWordPressNews); // POST /news/fetch-wordpress - Fetch news from WordPress (Admin only)
// Authenticated endpoint to trigger WordPress news fetch cron (for external cron, Cloudflare-protected)
router.post('/cron/fetch-wordpress-news', async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = req.headers['x-cron-secret'] || req.query?.secret;
    const isAuthorized = (cronSecret && providedSecret === cronSecret) || (req.user && ['admin', 'super_admin'].includes(req.user.role));

    if (!isAuthorized) {
      return res.status(401).json({ success: false, message: 'Unauthorized cron invocation' });
    }

    const wordpressUrl = process.env.WORDPRESS_NEWS_URL;
    if (!wordpressUrl) {
      return res.status(400).json({ success: false, message: 'WORDPRESS_NEWS_URL not set.' });
    }
    const result = await NewsService.fetchFromWordPress(wordpressUrl, 'recent');
    res.json({ success: true, message: 'WordPress news fetch triggered.', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected routes (authentication required)

// User interaction routes (authenticated users - uses token user)
router.post("/:id/like", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), likeNews); // POST /news/:id/like - Like news
router.delete("/:id/like", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), unlikeNews); // DELETE /news/:id/like - Unlike news
router.post("/:id/toggle-like", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), toggleLike); // POST /news/:id/toggle-like
router.post("/:id/view", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), viewNews); // POST /news/:id/view - Track view
router.post("/:id/share", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), shareNews); // POST /news/:id/share

router.get("/:id/interaction-status", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), checkUserInteractionStatus);
router.post("/:id/comment", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), addComment); // POST /news/:id/comment
router.post("/:id/comment/:commentId/reply", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), addReply);
router.delete("/:id/comment/:commentId", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), deleteComment);

// Admin only routes
// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }
  next();
};

// Admin only routes — auth is explicit on each route (do NOT rely on router.use)
router.post("/", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), isAdmin, combinedUpload, handleMulterError, createNews);
router.post(
  "/content-image",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  contentImageUpload.single("image"),
  handleMulterError,
  uploadContentImage
);
router.post(
  "/content-video",
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  contentVideoUpload.single("video"),
  handleMulterError,
  uploadContentVideo
);
router.put("/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), isAdmin, combinedUpload, handleMulterError, updateNews);
router.delete("/:id", accessTokenAutoRefresh, passport.authenticate("jwt", { session: false }), isAdmin, deleteNews);

export default router;
