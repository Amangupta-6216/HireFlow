const multer = require('multer');

// Memory storage so the file buffer can be uploaded directly to S3 or local fallback
const storage = multer.memoryStorage();

// Allowed MIME types for resumes
const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Allowed MIME types for logos and avatars
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

const resumeUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB limit as per specifications
  },
  fileFilter: (req, file, cb) => {
    if (RESUME_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX documents under 2 MB are supported.'), false);
    }
  },
});

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and WebP images under 2 MB are supported.'), false);
    }
  },
});

module.exports = {
  resumeUpload,
  imageUpload,
};
