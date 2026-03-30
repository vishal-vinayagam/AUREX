/**
 * Report Routes - AUREX Civic Issue Reporting System
 */

const express = require('express');
const router = express.Router();
const { reportController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');
const { validateReportPayload } = require('../middleware/reportValidation');
const {
  uploadSingleImage,
  uploadMultipleImages,
  handleUploadError
} = require('../middleware/upload');

// Statistics route (public)
router.get('/stats/overview', reportController.getStatistics);
router.get('/nearby', reportController.getNearbyReports);

// Protected routes
router.use(protect);

// Upload routes (Cloudinary)
router.post('/upload/single', uploadSingleImage, reportController.uploadSingleMedia);
router.post('/upload/multiple', uploadMultipleImages, reportController.uploadMultipleMedia);

// User routes
router.get('/my-reports', reportController.getMyReports);
router.post('/', uploadMultipleImages, validateReportPayload, reportController.createReport);
router.get('/', reportController.getReports);

// Single report routes
router.get('/:id', reportController.getReport);
router.put('/:id', reportController.updateReport);
router.delete('/:id', reportController.deleteReport);
router.post('/:id/upvote', reportController.upvoteReport);
router.post('/:id/feedback', reportController.submitFeedback);

// Admin only routes
router.put('/:id/status', adminOnly, reportController.updateStatus);
router.put('/:id/assign', adminOnly, reportController.assignReport);
router.post('/:id/response', adminOnly, reportController.addResponse);

// Multer error handler for this router
router.use(handleUploadError);

module.exports = router;
