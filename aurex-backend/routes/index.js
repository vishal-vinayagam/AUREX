/**
 * Routes Index - AUREX Civic Issue Reporting System
 * 
 * Central route registration file.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const reportRoutes = require('./reports');
const communityRoutes = require('./community');
const lawRoutes = require('./laws');
const messageRoutes = require('./messages');
const contactRoutes = require('./contacts');

// Register routes
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/community', communityRoutes);
router.use('/laws', lawRoutes);
router.use('/messages', messageRoutes);
router.use('/contacts', contactRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;