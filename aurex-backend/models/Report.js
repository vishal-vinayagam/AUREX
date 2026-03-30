/**
 * Report Model - AUREX Civic Issue Reporting System
 * 
 * This model defines the schema for civic issue reports submitted by users.
 * It includes comprehensive fields for issue details, location, media, and status tracking.
 */

const mongoose = require('mongoose');

// Status History Sub-Schema for tracking status changes
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'escalated'],
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    maxlength: 500
  }
}, { _id: true });

// Admin Response Sub-Schema
const adminResponseSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  respondedAt: {
    type: Date,
    default: Date.now
  },
  isInternal: {
    type: Boolean,
    default: false // Internal notes vs public responses
  }
}, { _id: true });

// Location Sub-Schema
const locationSchema = new mongoose.Schema({
  // GeoJSON Point format for geospatial queries
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;      // latitude
      },
      message: 'Invalid coordinates'
    }
  },
  address: {
    type: String,
    maxlength: 500
  },
  landmark: {
    type: String,
    maxlength: 200
  },
  pincode: {
    type: String,
    match: [/^[0-9]{6}$/, 'Invalid pincode']
  }
}, { _id: false });

// Media Sub-Schema for images and videos
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
    type: String, // Cloudinary public ID for deletion
    required: true
  },
  thumbnail: {
    type: String // For videos, thumbnail URL
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Main Report Schema
const reportSchema = new mongoose.Schema({
  // Report Identification
  reportId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Reporter Information
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  contactName: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact name cannot exceed 100 characters']
  },
  contactPhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Invalid contact phone']
  },
  
  // Issue Details
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  incidentAt: {
    type: Date
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'roads',
      'water_supply',
      'electricity',
      'sanitation',
      'garbage',
      'streetlights',
      'public_transport',
      'parks',
      'noise_pollution',
      'air_pollution',
      'illegal_construction',
      'traffic',
      'safety',
      'healthcare',
      'education',
      'other'
    ],
    index: true
  },
  subcategory: {
    type: String,
    maxlength: 100
  },
  categoryDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium',
    index: true
  },
  
  // Is this an emergency report
  isEmergency: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Location Information
  location: {
    type: locationSchema,
    required: true
  },
  
  // Media Evidence
  media: [mediaSchema],
  
  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'escalated'],
    default: 'pending',
    index: true
  },
  
  // Status Change History
  statusHistory: [statusHistorySchema],
  
  // Admin Responses
  adminResponses: [adminResponseSchema],
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date
  },
  
  // Resolution Details
  resolvedAt: {
    type: Date
  },
  resolutionNote: {
    type: String,
    maxlength: 2000
  },
  resolutionMedia: [mediaSchema],
  
  // User Feedback after resolution
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    submittedAt: {
      type: Date
    }
  },
  
  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Community Engagement
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvoteCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
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

// Create geospatial index for location-based queries
reportSchema.index({ location: '2dsphere' });

// Compound indexes for common query patterns
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ reportedBy: 1, createdAt: -1 });
reportSchema.index({ isEmergency: 1, status: 1 });

// Pre-save middleware to generate report ID and update timestamp
reportSchema.pre('save', async function(next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Generate unique report ID if new document
  if (this.isNew && !this.reportId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of reports created today for sequential number
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const count = await mongoose.model('Report').countDocuments({
      createdAt: { $gte: startOfDay }
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    this.reportId = `AUR${year}${month}${day}${sequence}`;
  }
  
  next();
});

// Pre-save middleware to update upvote count
reportSchema.pre('save', function(next) {
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }
  next();
});

// Instance method to add status history entry
reportSchema.methods.addStatusHistory = function(status, changedBy, note = '') {
  this.statusHistory.push({
    status,
    changedBy,
    note,
    changedAt: new Date()
  });
  this.status = status;
  
  // Update resolution timestamp if resolved
  if (status === 'resolved') {
    this.resolvedAt = new Date();
  }
  
  return this.save();
};

// Instance method to add admin response
reportSchema.methods.addAdminResponse = function(message, respondedBy, isInternal = false) {
  this.adminResponses.push({
    message,
    respondedBy,
    isInternal,
    respondedAt: new Date()
  });
  return this.save();
};

// Instance method to upvote
reportSchema.methods.upvote = function(userId) {
  const index = this.upvotes.indexOf(userId);
  if (index === -1) {
    this.upvotes.push(userId);
    this.upvoteCount = this.upvotes.length;
  }
  return this.save();
};

// Instance method to remove upvote
reportSchema.methods.removeUpvote = function(userId) {
  const index = this.upvotes.indexOf(userId);
  if (index > -1) {
    this.upvotes.splice(index, 1);
    this.upvoteCount = this.upvotes.length;
  }
  return this.save();
};

// Static method to find reports near a location
reportSchema.statics.findNearby = function(coordinates, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

// Static method to get statistics
reportSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        underReview: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        emergency: { $sum: { $cond: [{ $eq: ['$isEmergency', true] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    emergency: 0
  };
};

// Create and export the Report model
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
