import express from "express";
import rateLimit from "express-rate-limit";
import {
  getPublicTemplate,
  submitLead,
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
  getAllLeads,
  updateLeadStatus,
  deleteLead,
  exportLeadsCsv,
} from "../controllers/builderController.js";
import accessTokenAutoRefresh from "../middlewares/accessTokenAutoRefresh.js";
import passport from "passport";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Rate limiter for public lead submission to prevent spam/abuse
const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 submissions per windowMs
  message: {
    success: false,
    message: "Too many submissions from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================
// Public Routes
// ==========================
router.get("/public/:slug", getPublicTemplate);
router.post("/public/:slug/lead", leadLimiter, submitLead);

// ==========================
// Admin Protected Routes
// ==========================
const adminAuth = [
  accessTokenAutoRefresh,
  passport.authenticate("jwt", { session: false }),
  isAdmin,
];

// Template routes
router.get("/templates", adminAuth, getAllTemplates);
router.post("/templates", adminAuth, createTemplate);
router.get("/templates/:id", adminAuth, getTemplateById);
router.put("/templates/:id", adminAuth, updateTemplate);
router.delete("/templates/:id", adminAuth, deleteTemplate);
router.post("/templates/:id/clone", adminAuth, cloneTemplate);

// Lead management routes
router.get("/leads/export", adminAuth, exportLeadsCsv);
router.get("/leads", adminAuth, getAllLeads);
router.put("/leads/:id/status", adminAuth, updateLeadStatus);
router.delete("/leads/:id", adminAuth, deleteLead);

export default router;
