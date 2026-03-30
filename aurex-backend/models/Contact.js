/**
 * Contact Model - AUREX Civic Issue Reporting System
 * 
 * This model defines the schema for storing official emergency and helpline contacts.
 * Includes categorization and quick dial functionality.
 */

const mongoose = require('mongoose');

// Main Contact Schema
const contactSchema = new mongoose.Schema({
  // Contact Name
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  
  // Category
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'emergency',      // Police, Fire, Ambulance
      'healthcare',     // Hospitals, Clinics
      'utilities',      // Water, Electricity, Gas
      'municipal',      // Municipal Corporation
      'police',         // Police Stations
      'fire',           // Fire Department
      'disaster',       // Disaster Management
      'women_safety',   // Women Helpline
      'child_safety',   // Child Helpline
      'senior_citizen', // Senior Citizen Helpline
      'transport',      // Transport Department
      'legal',          // Legal Aid
      'consumer',       // Consumer Affairs
      'corruption',     // Anti-Corruption
      'other'
    ],
    index: true
  },
  
  // Subcategory for finer classification
  subcategory: {
    type: String,
    maxlength: 100
  },
  
  // Role or designation (optional, e.g. "City Mayor", "Fire Chief")
  role: {
    type: String,
    maxlength: [200, 'Role cannot exceed 200 characters'],
    default: null
  },
  // Description
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Phone Numbers
  phoneNumbers: [{
    number: {
      type: String,
      required: true,
      match: [/^[0-9\-\+\s\(\)]{8,20}$/, 'Invalid phone number format']
    },
    label: {
      type: String,
      maxlength: 50,
      default: 'Primary'
    },
    isTollFree: {
      type: Boolean,
      default: false
    },
    isAvailable24x7: {
      type: Boolean,
      default: true
    },
    availability: {
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      timeStart: String, // HH:MM format
      timeEnd: String    // HH:MM format
    }
  }],
  
  // Email Addresses
  emails: [{
    email: {
      type: String,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email format']
    },
    label: {
      type: String,
      maxlength: 50,
      default: 'General'
    }
  }],
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  
  // Location (for map display)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  
  // Website
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Invalid URL format']
  },
  
  // Is this an emergency contact
  isEmergency: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Priority for display order (higher = more important)
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Is contact active
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Jurisdiction/Area served
  jurisdiction: {
    type: String,
    enum: ['national', 'state', 'district', 'city', 'local'],
    default: 'local'
  },
  
  // Applicable locations
  applicableLocations: [{
    city: String,
    state: String,
    pincode: String
  }],
  
  // Operating hours
  operatingHours: {
    is24x7: {
      type: Boolean,
      default: true
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      open: String, // HH:MM
      close: String // HH:MM
    }]
  },
  
  // Services offered
  services: [{
    type: String,
    maxlength: 200
  }],
  
  // Languages supported
  languages: [{
    type: String,
    enum: ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'ur', 'other']
  }],
  
  // Icon/Logo
  icon: {
    type: String, // URL to icon image
    default: null
  },
  
  // View count
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Call count (if integrated with phone)
  callCount: {
    type: Number,
    default: 0
  },
  
  // Created/Updated by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
contactSchema.index({ category: 1, isActive: 1, priority: -1 });
contactSchema.index({ isEmergency: 1, priority: -1 });
contactSchema.index({ location: '2dsphere' });
contactSchema.index({ 'applicableLocations.city': 1 });
contactSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to increment view count
contactSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment call count
contactSchema.methods.incrementCalls = function() {
  this.callCount += 1;
  return this.save();
};

// Instance method to get primary phone number
contactSchema.methods.getPrimaryPhone = function() {
  if (this.phoneNumbers.length === 0) return null;
  return this.phoneNumbers.find(p => p.label === 'Primary') || this.phoneNumbers[0];
};

// Static method to get emergency contacts
contactSchema.statics.getEmergencyContacts = function(limit = 10) {
  return this.find({
    isEmergency: true,
    isActive: true
  })
    .sort({ priority: -1 })
    .limit(limit);
};

// Static method to get contacts by category
contactSchema.statics.getByCategory = function(category, options = {}) {
  const { limit = 20, page = 1 } = options;
  
  return this.find({
    category,
    isActive: true
  })
    .sort({ priority: -1, name: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to search contacts
contactSchema.statics.search = function(query, options = {}) {
  const { category, limit = 20, page = 1 } = options;
  
  const searchQuery = {
    isActive: true,
    $text: { $search: query }
  };
  
  if (category) {
    searchQuery.category = category;
  }
  
  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' }, priority: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to find nearby contacts
contactSchema.statics.findNearby = function(coordinates, maxDistance = 10000, options = {}) {
  const { category, limit = 20 } = options;
  
  const query = {
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query).limit(limit);
};

// Create and export the Contact model
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;