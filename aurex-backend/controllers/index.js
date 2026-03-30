/**
 * Controllers Index - AUREX Civic Issue Reporting System
 * 
 * Central export file for all controllers.
 */

const authController = require('./authController');
const reportController = require('./reportController');
const communityController = require('./communityController');
const lawController = require('./lawController');
const messageController = require('./messageController');
const contactController = require('./contactController');

module.exports = {
  authController,
  reportController,
  communityController,
  lawController,
  messageController,
  contactController
};