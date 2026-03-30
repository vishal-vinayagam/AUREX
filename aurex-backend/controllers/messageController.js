/**
 * Message Controller - AUREX Civic Issue Reporting System
 * 
 * Handles messaging between users and admins, conversations, and real-time updates.
 */

const Message = require('../models/Message');
const User = require('../models/User');
const { uploadFile } = require('../config/cloudinary');

const uploadMessageMediaFile = async (file) => {
  const result = await uploadFile(file.buffer, {
    folder: 'aurex/messages',
    resourceType: 'auto',
    public_id: `message_${Date.now()}`
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    thumbnail: result.resource_type === 'video' ? result.secure_url : undefined
  };
};

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const {
      recipientId,
      content,
      messageType = 'text',
      media,
      relatedReportId,
      replyTo
    } = req.body;

    // Validation
    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient ID'
      });
    }

    if (!content && !media) {
      return res.status(400).json({
        success: false,
        message: 'Please provide message content or media'
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(req.user._id, recipientId);

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      recipient: recipientId,
      content,
      messageType,
      media,
      relatedReport: relatedReportId || null,
      replyTo: replyTo || null,
      status: 'sent',
      sentAt: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('recipient', 'name avatar role')
      .populate('replyTo', 'content sender');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

/**
 * @desc    Upload a single message attachment to Cloudinary
 * @route   POST /api/messages/upload/single
 * @access  Private
 */
exports.uploadSingleMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const media = await uploadMessageMediaFile(req.file);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: { media }
    });
  } catch (error) {
    console.error('Message upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

/**
 * @desc    Get conversation between two users
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.getConversation(
      req.user._id,
      userId,
      { page: parseInt(page), limit: parseInt(limit) }
    );

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's conversations list
 * @route   GET /api/messages/conversations
 * @access  Private
 */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user._id);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.lastMessage.sender._id.toString() === req.user._id.toString()
          ? conv.lastMessage.recipient
          : conv.lastMessage.sender;

        const otherUser = await User.findById(otherUserId).select('name avatar role');

        return {
          ...conv,
          otherUser
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        conversations: populatedConversations
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

/**
 * @desc    Mark message as read
 * @route   PUT /api/messages/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only recipient can mark as read
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    await message.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
};

/**
 * @desc    Mark all messages in conversation as read
 * @route   PUT /api/messages/conversation/:userId/read-all
 * @access  Private
 */
exports.markConversationAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversationId = Message.generateConversationId(req.user._id, userId);

    await Message.markConversationAsRead(conversationId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

/**
 * @desc    Edit message
 * @route   PUT /api/messages/:id
 * @access  Private (Sender only)
 */
exports.editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new content'
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can edit
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    // Can only edit within 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'Message can only be edited within 15 minutes of sending'
      });
    }

    await message.edit(content);

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message
    });
  }
};

/**
 * @desc    Delete message (soft delete)
 * @route   DELETE /api/messages/:id
 * @access  Private (Sender or Admin)
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permissions
    const isSender = message.sender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isSender && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.softDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

/**
 * @desc    Add reaction to message
 * @route   POST /api/messages/:id/reaction
 * @access  Private
 */
exports.addReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an emoji'
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.addReaction(req.user._id, emoji);

    res.status(200).json({
      success: true,
      message: 'Reaction added',
      data: { reactions: message.reactions }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction',
      error: error.message
    });
  }
};

/**
 * @desc    Remove reaction from message
 * @route   DELETE /api/messages/:id/reaction
 * @access  Private
 */
exports.removeReaction = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.removeReaction(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Reaction removed',
      data: { reactions: message.reactions }
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing reaction',
      error: error.message
    });
  }
};

/**
 * @desc    Get admins for messaging
 * @route   GET /api/messages/admins
 * @access  Private
 */
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'superadmin'] },
      isActive: true
    }).select('name avatar role');

    res.status(200).json({
      success: true,
      data: {
        admins
      }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
};
