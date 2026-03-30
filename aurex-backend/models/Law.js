/**
 * Law Model - AUREX Civic Issue Reporting System
 * 
 * This model defines the schema for storing civic laws, acts, and awareness information.
 * Includes categorization, search functionality, and multilingual support.
 */

const mongoose = require('mongoose');

// Translation Sub-Schema for multilingual support
const translationSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ['en', 'ta', 'hi'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: String
}, { _id: false });

// Reference Sub-Schema for related documents/links
const referenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: String,
  type: {
    type: String,
    enum: ['document', 'website', 'video', 'pdf'],
    default: 'website'
  }
}, { _id: true });

// Main Law Schema
const lawSchema = new mongoose.Schema({
  // Law Identification
  lawId: {
    type: String,
    unique: true,
    index: true
  },
  
  // Category
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'civic_rights',
      'municipal_laws',
      'environment',
      'public_safety',
      'consumer_protection',
      'traffic_rules',
      'building_regulations',
      'health_sanitation',
      'education',
      'employment',
      'other'
    ],
    index: true
  },
  
  // Subcategory for finer classification
  subcategory: {
    type: String,
    maxlength: 100
  },
  
  // English Content (default)
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters'],
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Full content of the law/act
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content cannot exceed 50000 characters']
  },
  
  // Brief summary for quick reading
  summary: {
    type: String,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  
  // Key points/takeaways
  keyPoints: [{
    type: String,
    maxlength: 500
  }],
  
  // Multilingual translations
  translations: [translationSchema],
  
  // Act/Law Number
  actNumber: {
    type: String,
    maxlength: 100
  },
  
  // Year of enactment
  year: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  
  // Jurisdiction
  jurisdiction: {
    type: String,
    enum: ['central', 'state', 'local', 'national'],
    default: 'central'
  },
  
  // Applicable states (if state-specific)
  applicableStates: [{
    type: String,
    trim: true
  }],
  
  // Is this law currently active
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Has this been repealed or amended
  status: {
    type: String,
    enum: ['active', 'amended', 'repealed', 'pending'],
    default: 'active'
  },
  
  // Is this a featured/important law
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Priority level for display order
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Penalties/Fines (if applicable)
  penalties: [{
    offense: String,
    penalty: String,
    fineAmount: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    }
  }],
  
  // Related laws
  relatedLaws: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Law'
  }],
  
  // External references
  references: [referenceSchema],
  
  // Tags for searchability
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // Keywords for search (auto-generated)
  keywords: [{
    type: String,
    index: true
  }],
  
  // View count
  viewCount: {
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

// Text index for search functionality
lawSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text',
  tags: 'text',
  keywords: 'text'
});

// Compound indexes
lawSchema.index({ category: 1, isActive: 1, priority: -1 });
lawSchema.index({ isFeatured: 1, priority: -1 });
lawSchema.index({ status: 1, isActive: 1 });

// Pre-save middleware to generate law ID and update timestamp
lawSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Generate unique law ID if new document
  if (this.isNew && !this.lawId) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const count = await mongoose.model('Law').countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    this.lawId = `LAW${categoryCode}${sequence}`;
  }
  
  // Generate keywords from title, tags, and description
  if (this.isModified('title') || this.isModified('tags') || this.isModified('description')) {
    const keywords = new Set();
    
    // Extract words from title
    this.title.split(/\s+/).forEach(word => {
      if (word.length > 3) keywords.add(word.toLowerCase());
    });
    
    // Add tags
    this.tags.forEach(tag => keywords.add(tag.toLowerCase()));
    
    // Extract important words from description
    this.description.split(/\s+/).forEach(word => {
      if (word.length > 5) keywords.add(word.toLowerCase());
    });
    
    this.keywords = Array.from(keywords);
  }
  
  next();
});

// Instance method to increment view count
lawSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to get translation
lawSchema.methods.getTranslation = function(language) {
  if (language === 'en') {
    return {
      title: this.title,
      description: this.description,
      content: this.content,
      summary: this.summary
    };
  }
  
  const translation = this.translations.find(t => t.language === language);
  return translation || {
    title: this.title,
    description: this.description,
    content: this.content,
    summary: this.summary
  };
};

// Static method to search laws
lawSchema.statics.search = function(query, options = {}) {
  const { category, language = 'en', limit = 20, page = 1 } = options;
  
  const searchQuery = {
    isActive: true,
    $text: { $search: query }
  };
  
  if (category) {
    searchQuery.category = category;
  }
  
  return this.find(searchQuery)
    .select(language === 'en' ? null : { translations: { $elemMatch: { language } } })
    .sort({ score: { $meta: 'textScore' }, priority: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get laws by category
lawSchema.statics.getByCategory = function(category, options = {}) {
  const { limit = 20, page = 1, includeInactive = false } = options;
  
  const query = { category };
  if (!includeInactive) {
    query.isActive = true;
  }
  
  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get featured laws
lawSchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    isFeatured: true,
    isActive: true,
    status: 'active'
  })
    .sort({ priority: -1, viewCount: -1 })
    .limit(limit);
};

// Create and export the Law model
const Law = mongoose.model('Law', lawSchema);

module.exports = Law;