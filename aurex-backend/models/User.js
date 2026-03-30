/**
 * User Model - AUREX Civic Issue Reporting System
 * 
 * This model defines the schema for both regular users and admin users.
 * It includes fields for authentication, profile information, and user roles.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema Definition
const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // User Role - determines access level
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null // Cloudinary URL for profile image
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  
  // User Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ta', 'hi'],
      default: 'en'
    },
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Firebase Cloud Messaging Token for push notifications
  fcmToken: {
    type: String,
    default: null
  },
  
  // Firebase UID (for Firebase Auth integration)
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Password Reset Fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Timestamps
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on every save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile (hide sensitive data)
userSchema.methods.toPublicProfile = function() {
  return {
    _id: this._id,
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    avatar: this.avatar,
    preferences: this.preferences,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
