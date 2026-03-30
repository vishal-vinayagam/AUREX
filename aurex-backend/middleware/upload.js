/**
 * Upload Middleware - AUREX Civic Issue Reporting System
 * 
 * Handles file uploads using Multer and Cloudinary integration.
 */

const multer = require('multer');
const path = require('path');

// Configure storage (memory storage for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  // Allowed mime types
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  const allowedVideoTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm'
  ];

  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allAllowedTypes = [
    ...allowedImageTypes,
    ...allowedVideoTypes,
    ...allowedDocumentTypes
  ];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${file.mimetype}`), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 5 // Max 5 files per upload
  }
});

// Middleware for single image upload
exports.uploadSingleImage = upload.single('image');

// Middleware for multiple image upload
exports.uploadMultipleImages = upload.array('images', 5);

// Middleware for mixed media upload (images and videos)
exports.uploadMixedMedia = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);

// Middleware for any file type
exports.uploadAny = upload.any();

// Error handler for multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB.',
        errorCode: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files.',
        errorCode: 'TOO_MANY_FILES'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
        errorCode: 'UNEXPECTED_FILE_FIELD'
      });
    }
  }
  
  if (err) {
    console.error('Upload error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: 'UPLOAD_ERROR'
    });
  }
  
  // Log successful file upload
  if (req.file) {
    console.log('File successfully uploaded:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  }
  
  next();
};

// Validate file types helper
exports.validateFileType = (file, allowedTypes = ['image', 'video']) => {
  const fileType = file.mimetype.split('/')[0];
  return allowedTypes.includes(fileType);
};

// Get file extension
exports.getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Generate unique filename
exports.generateFilename = (originalname, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalname);
  return `${prefix}${timestamp}_${random}${extension}`;
};