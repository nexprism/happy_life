import express from "express";
import protectedUploads from "./middlewares/protectedUploads.js";
import downloadLinks from "./middlewares/downloadLinks.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register Passport JWT strategy before using passport
import "./config/jwt-authenticate.js";

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Render load balancer)

// CORS config — dynamic origin to support credentials (wildcard '*' is
// incompatible with credentials:true per the browser spec)
const ALLOWED_ORIGINS = [
  "https://happy-life-nu.vercel.app",
  "https://happy-life-admin.vercel.app",
  "https://happy-life-sx03.onrender.com",
  "https://api.happylifeastro.school",
  "https://happylifeastro.school",
  "https://www.happylifeastro.school",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:5000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost port for local development
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Deny unknown origins
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-access-token",
    "x-refresh-token",
    "X-Requested-With",
  ],
  exposedHeaders: ["x-access-token", "x-refresh-token"],
};
app.use(cors(corsOptions));
// Handle OPTIONS preflight for all routes (path-to-regexp v8+ compatible syntax)
app.options("/{*splat}", cors(corsOptions));

app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", protectedUploads);

// Serve static files with secure headers and cross-origin access
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const lower = filePath.toLowerCase();
    if (lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".svg") || lower.endsWith(".xml")) {
      res.setHeader("Content-Disposition", "attachment");
    }
  }
}), (req, res) => {
  const defaultFile = path.join(__dirname, "uploads", "default_course.png");
  res.sendFile(defaultFile);
});

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 1000,
  skip: (req) => {
    // In local development, avoid locking out testing from localhost
    if (process.env.NODE_ENV !== 'production') {
      const ip = req.ip || req.connection?.remoteAddress || '';
      if (ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'localhost') {
        return true;
      }
    }
    return false;
  },
  message: { success: false, message: "Too many attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Disable X-Powered-By header to prevent technology fingerprinting (Finding F01)
app.disable("x-powered-by");

// Middlewares
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin asset serving
  frameguard: { action: 'sameorigin' }, // Protect against clickjacking
  hsts: { maxAge: 31536000, includeSubDomains: true }, // 1-year HSTS
  noSniff: true, // X-Content-Type-Options: nosniff
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true,
}));

// Increase body parser limits and timeouts for large file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Apply auth rate limiter to login, signup, and OTP routes
app.use('/login', authLimiter);
app.use('/signup', authLimiter);
app.use('/sendotp', authLimiter);
app.use('/verifyotp', authLimiter);
app.use('/send-otp', authLimiter);
app.use('/verify-otp', authLimiter);
app.use('/user/send-otp', authLimiter);
app.use('/user/verify-otp', authLimiter);
app.use('/user/sendotp', authLimiter);
app.use('/user/verifyotp', authLimiter);
app.use('/forgot-password', authLimiter);
app.use('/reset-password', authLimiter);

// Set global timeouts for large file operations
app.use((req, res, next) => {
  // Set much longer timeouts for chunk upload routes
  if (req.path.includes('/chunk') || req.path.includes('/upload')) {
    req.setTimeout(7200000); // 120 minutes (2 hours)
    res.setTimeout(7200000); // 120 minutes (2 hours)
  } else if (req.path.includes('/video') || req.path.includes('/file')) {
    req.setTimeout(1800000); // 30 minutes for video/file operations
    res.setTimeout(1800000); // 30 minutes for video/file operations
  } else {
    req.setTimeout(600000); // 10 minutes for other routes
    res.setTimeout(600000); // 10 minutes for other routes
  }
  next();
});

// API Routes
app.use(downloadLinks);
app.use("/", routes);

// Global 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Global sanitized error handler (prevents leaking internal stack traces / server paths)
app.use((err, req, res, next) => {
  console.error("Unhandled Application Error:", err.message);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "An internal error occurred. Please try again later." : (err.message || "Internal server error"),
  });
});

export default app;

