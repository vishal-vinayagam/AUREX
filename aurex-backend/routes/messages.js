/**
 * Message Routes - AUREX Civic Issue Reporting System
 */

const express = require('express');
const router = express.Router();
const { messageController } = require('../controllers');
const { protect } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError } = require('../middleware/upload');

// All routes are protected
router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/conversation/:userId', messageController.getConversation);
router.put('/conversation/:userId/read-all', messageController.markConversationAsRead);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/admins', messageController.getAdmins);

router.post('/upload/single', uploadSingleImage, handleUploadError, messageController.uploadSingleMedia);
router.post('/', messageController.sendMessage);
router.get('/:id', async (req, res) => {
  // Alias for getting a single message - reuse conversation logic
  res.status(200).json({ success: true, message: 'Use conversation endpoint' });
});
router.put('/:id/read', messageController.markAsRead);
router.put('/:id', messageController.editMessage);
router.delete('/:id', messageController.deleteMessage);
router.post('/:id/reaction', messageController.addReaction);
router.delete('/:id/reaction', messageController.removeReaction);

module.exports = router;
