/**
 * Community Post Model - AUREX Civic Issue Reporting System
 * 
 * This model defines the schema for community posts and announcements.
 * Supports Instagram-style feed with likes, comments, and admin stories.
 */

const mongoose = require('mongoose');

// Comment Sub-Schema
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Media Sub-Schema
const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  thumbnail: String
}, { _id: true });

// Attachment Sub-Schema (documents)
const attachmentSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['document'],
    default: 'document'
  },
  publicId: {
    type: String,
    required: true
  },
  name: String
}, { _id: true });

// Main Community Post Schema
const communityPostSchema = new mongoose.Schema({
  // Post Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Is this an anonymous post
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Is this an official announcement from admin
  isAnnouncement: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Is this a story (disappears after 24 hours)
  isStory: {
    type: Boolean,
    default: false
  },
  
  // Story expiration time
  storyExpiresAt: {
    type: Date
  },
  
  // Structured Post Fields
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['announcement', 'event', 'emergency', 'notice'],
    default: 'notice'
  },
  description: {
    type: String,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  locationName: {
    type: String,
    maxlength: 200
  },
  eventDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'normal'],
    default: 'normal'
  },
  allowComments: {
    type: Boolean,
    default: true
  },

  // Post Content
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  
  // Media Attachments
  media: [mediaSchema],
  attachments: [attachmentSchema],
  
  // Related Report (if post is about a specific report)
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  
  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  commentCount: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  // View count for stories
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Post Status
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted', 'under_review'],
    default: 'active'
  },
  
  // Is post pinned (for announcements)
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Moderation
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportCount: {
    type: Number,
    default: 0
  },
  
  // Moderation note
  moderationNote: {
    type: String,
    maxlength: 500
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
communityPostSchema.index({ status: 1, createdAt: -1 });
communityPostSchema.index({ isAnnouncement: 1, isPinned: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ isStory: 1, storyExpiresAt: 1 });

// Pre-save middleware to update counts and timestamps
communityPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update counts
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.commentCount = this.comments.length;
  }
  if (this.isModified('views')) {
    this.viewCount = this.views.length;
  }
  if (this.isModified('reportedBy')) {
    this.reportCount = this.reportedBy.length;
  }
  
  // Set story expiration if it's a story
  if (this.isStory && !this.storyExpiresAt) {
    this.storyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  
  next();
});

// Instance method to add like
communityPostSchema.methods.addLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
    this.likeCount = this.likes.length;
  }
  return this.save();
};

// Instance method to remove like
communityPostSchema.methods.removeLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likeCount = this.likes.length;
  }
  return this.save();
};

// Instance method to add comment
communityPostSchema.methods.addComment = function(userId, content, isAnonymous = false) {
  this.comments.push({
    user: userId,
    content,
    isAnonymous,
    createdAt: new Date()
  });
  this.commentCount = this.comments.length;
  return this.save();
};

// Instance method to remove comment
communityPostSchema.methods.removeComment = function(commentId) {
  const index = this.comments.findIndex(c => c._id.toString() === commentId);
  if (index > -1) {
    this.comments.splice(index, 1);
    this.commentCount = this.comments.length;
  }
  return this.save();
};

// Instance method to add view (for stories)
communityPostSchema.methods.addView = function(userId) {
  const alreadyViewed = this.views.some(v => v.user.toString() === userId.toString());
  if (!alreadyViewed) {
    this.views.push({ user: userId, viewedAt: new Date() });
    this.viewCount = this.views.length;
  }
  return this.save();
};

// Instance method to report post
communityPostSchema.methods.report = function(userId, reason) {
  const alreadyReported = this.reportedBy.some(r => r.user.toString() === userId.toString());
  if (!alreadyReported) {
    this.reportedBy.push({ user: userId, reason, reportedAt: new Date() });
    this.reportCount = this.reportedBy.length;
    
    // Auto-hide if reported too many times
    if (this.reportCount >= 5) {
      this.status = 'under_review';
    }
  }
  return this.save();
};

// Instance method to share
communityPostSchema.methods.incrementShares = function() {
  this.shares += 1;
  return this.save();
};

// Static method to get feed posts
communityPostSchema.statics.getFeed = function(options = {}) {
  const { 
    page = 1, 
    limit = 10, 
    includeStories = true,
    userId = null 
  } = options;
  
  const query = {
    status: 'active',
    isStory: false
  };
  
  if (includeStories) {
    delete query.isStory;
    query.$or = [
      { isStory: false },
      { isStory: true, storyExpiresAt: { $gt: new Date() } }
    ];
  }
  
  return this.find(query)
    .populate('author', 'name avatar role')
    .populate('relatedReport', 'reportId title status')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get stories
communityPostSchema.statics.getStories = function() {
  return this.find({
    isStory: true,
    status: 'active',
    storyExpiresAt: { $gt: new Date() }
  })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 });
};

// Static method to get announcements
communityPostSchema.statics.getAnnouncements = function(limit = 10) {
  return this.find({
    isAnnouncement: true,
    status: 'active'
  })
    .populate('author', 'name avatar role')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(limit);
};

// Create and export the CommunityPost model
const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);

module.exports = CommunityPost;
