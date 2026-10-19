import multer from "multer";
import path from "path";
import crypto from "crypto";

const DISALLOWED_EXT = [
  '.html', '.htm', '.xhtml', '.svg', '.php', '.php3', '.php4', '.phtml',
  '.jsp', '.asp', '.aspx', '.exe', '.sh', '.bat', '.cmd', '.js', '.mjs',
  '.vbs', '.cgi', '.pl'
];

const ALLOWED_MIME = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
  'application/pdf', 'application/epub+zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/aac', 'audio/webm',
  'video/mp4', 'video/mpeg', 'video/webm', 'video/ogg', 'video/x-msvideo',
  'application/zip', 'application/x-zip-compressed',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(8).toString("hex");
    cb(null, uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (DISALLOWED_EXT.includes(ext)) {
    return cb(new Error(`File extension ${ext} is not permitted for upload`), false);
  }

  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
export { upload };
