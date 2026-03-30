/**
 * Authentication Routes - AUREX Civic Issue Reporting System
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError } = require('../middleware/upload');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateProfile);
router.post('/upload/avatar', protect, uploadSingleImage, handleUploadError, authController.uploadAvatar);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
