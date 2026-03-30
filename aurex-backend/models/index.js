/**
 * Models Index - AUREX Civic Issue Reporting System
 * 
 * Central export file for all database models.
 * Provides easy access to all models from a single import.
 */

const User = require('./User');
const Report = require('./Report');
const CommunityPost = require('./CommunityPost');
const Law = require('./Law');
const Message = require('./Message');
const Contact = require('./Contact');

// Export all models
module.exports = {
  User,
  Report,
  CommunityPost,
  Law,
  Message,
  Contact
};