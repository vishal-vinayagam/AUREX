/**
 * Message Model - AUREX Civic Issue Reporting System
 * 
 * This model defines the schema for user-admin messaging system.
 * Supports one-to-one conversations with real-time updates.
 */

const mongoose = require('mongoose');

// Message Schema
const messageSchema = new mongoose.Schema({
  // Conversation/Thread ID
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Sender Information
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Recipient Information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Related Report (if message is about a specific report)
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  
  // Message Content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  
  // Message Type
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'audio', 'location', 'system'],
    default: 'text'
  },
  
  // Media Attachment (for non-text messages)
  media: {
    url: String,
    publicId: String,
    thumbnail: String,
    size: Number, // in bytes
    mimeType: String
  },
  
  // Message Status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Timestamps for status tracking
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  
  // Is this a system message (auto-generated)
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  
  // System message type
  systemType: {
    type: String,
    enum: ['status_update', 'assignment', 'reminder', 'welcome', 'closure', null],
    default: null
  },
  
  // Is message deleted (soft delete)
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Is message edited
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  originalContent: {
    type: String
  },
  
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Reactions/Emojis
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      maxlength: 10
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Created at
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, status: 1 }); // For finding unread messages
messageSchema.index({ relatedReport: 1, createdAt: -1 });

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Update status timestamps
  if (this.isModified('status')) {
    if (this.status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
    if (this.status === 'read' && !this.readAt) {
      this.readAt = new Date();
    }
  }
  
  next();
});

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark as delivered
messageSchema.methods.markAsDelivered = function() {
  if (this.status === 'sent') {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to soft delete
messageSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Instance method to edit message
messageSchema.methods.edit = function(newContent) {
  if (!this.isEdited) {
    this.originalContent = this.content;
  }
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  const existingIndex = this.reactions.findIndex(
    r => r.user.toString() === userId.toString()
  );
  
  if (existingIndex > -1) {
    // Update existing reaction
    this.reactions[existingIndex].emoji = emoji;
  } else {
    // Add new reaction
    this.reactions.push({ user: userId, emoji, createdAt: new Date() });
  }
  
  return this.save();
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  return this.save();
};

// Static method to generate conversation ID
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  // Sort IDs to ensure consistency
  const sorted = [userId1.toString(), userId2.toString()].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

// Static method to get conversation messages
messageSchema.statics.getConversation = function(userId1, userId2, options = {}) {
  const { page = 1, limit = 50 } = options;
  const conversationId = this.generateConversationId(userId1, userId2);
  
  return this.find({
    conversationId,
    isDeleted: false
  })
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    status: { $in: ['sent', 'delivered'] },
    isDeleted: false,
    isSystemMessage: false
  });
};

// Static method to get user's conversations
messageSchema.statics.getUserConversations = async function(userId) {
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { recipient: new mongoose.Types.ObjectId(userId) }
        ],
        isDeleted: false
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$recipient', new mongoose.Types.ObjectId(userId)] },
                  { $in: ['$status', ['sent', 'delivered']] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
  
  return conversations;
};

// Static method to mark all as read in conversation
messageSchema.statics.markConversationAsRead = function(conversationId, userId) {
  return this.updateMany(
    {
      conversationId,
      recipient: userId,
      status: { $ne: 'read' }
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );
};

// Create and export the Message model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;