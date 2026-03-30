/**
 * Law Routes - AUREX Civic Issue Reporting System
 */

const express = require('express');
const router = express.Router();
const { lawController } = require('../controllers');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/categories', lawController.getCategories);
router.get('/featured', lawController.getFeatured);
router.get('/search', lawController.searchLaws);
router.get('/category/:category', lawController.getByCategory);
router.get('/:id', optionalAuth, lawController.getLaw);
router.get('/', optionalAuth, lawController.getLaws);

// Protected admin routes
router.use(protect);
router.use(adminOnly);

router.post('/', lawController.createLaw);
router.put('/:id', lawController.updateLaw);
router.delete('/:id', lawController.deleteLaw);

module.exports = router;