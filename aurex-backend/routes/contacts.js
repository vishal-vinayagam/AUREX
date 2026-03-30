/**
 * Contact Routes - AUREX Civic Issue Reporting System
 */

const express = require('express');
const router = express.Router();
const { contactController } = require('../controllers');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/categories', contactController.getCategories);
router.get('/emergency', contactController.getEmergencyContacts);
router.get('/search', contactController.searchContacts);
router.get('/nearby', contactController.getNearby);
router.get('/category/:category', contactController.getByCategory);
router.get('/:id', optionalAuth, contactController.getContact);
router.get('/', optionalAuth, contactController.getContacts);

// Protected routes
router.use(protect);

router.post('/:id/call', contactController.recordCall);

// Admin only routes
router.use(adminOnly);

router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;