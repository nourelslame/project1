/**
 * File: middleware/upload.js
 * Purpose: Multer middleware for handling file uploads (logo, profile photos).
 * Files are saved to uploads/logos/ or uploads/photos/ with a unique name.
 */

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// ── Storage config ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Choose subfolder based on the fieldname
    const sub = file.fieldname === 'logo' ? 'logos' : 'photos';
    const dir = path.join(__dirname, '..', 'uploads', sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // userId_timestamp.ext  — avoids name collisions
    const ext      = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${req.user.id}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// ── File filter — images only ────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif).'), false);
  }
};

// ── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB max
});

module.exports = upload;