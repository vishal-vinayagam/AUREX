/**
 * Community Routes - AUREX Civic Issue Reporting System
 */

const express = require('express');
const router = express.Router();
const { communityController } = require('../controllers');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { uploadSingleImage, uploadAny, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/announcements', optionalAuth, communityController.getAnnouncements);

// Protected routes
router.use(protect);

router.get('/feed', communityController.getFeed);
router.get('/stories', communityController.getStories);
router.post('/stories/:id/view', communityController.addStoryView);
router.post('/upload/single', uploadSingleImage, handleUploadError, communityController.uploadSingleMedia);
router.post('/upload/attachments', uploadAny, handleUploadError, communityController.uploadAttachments);
router.post('/posts', communityController.createPost);
router.get('/posts/:id', communityController.getPost);
router.put('/posts/:id', communityController.updatePost);
router.delete('/posts/:id', communityController.deletePost);
router.post('/posts/:id/like', communityController.likePost);
router.post('/posts/:id/comments', communityController.addComment);
router.delete('/posts/:postId/comments/:commentId', communityController.deleteComment);
router.post('/posts/:id/report', communityController.reportPost);
router.post('/posts/:id/share', communityController.sharePost);

// Admin only routes
router.put('/posts/:id/pin', adminOnly, communityController.pinPost);

module.exports = router;
