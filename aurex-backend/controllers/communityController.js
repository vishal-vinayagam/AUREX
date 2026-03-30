/**
 * Community Controller - AUREX Civic Issue Reporting System
 * 
 * Handles community posts, comments, likes, and feed operations.
 */

const CommunityPost = require('../models/CommunityPost');
const Report = require('../models/Report');
const { uploadFile } = require('../config/cloudinary');

const uploadCommunityMedia = async (file, folder = 'aurex/community') => {
  const result = await uploadFile(file.buffer, {
    folder,
    resourceType: 'auto',
    public_id: `community_${Date.now()}_${Math.floor(Math.random() * 10000)}`
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    type: result.resource_type === 'video' ? 'video' : 'image',
    thumbnail: result.resource_type === 'video' ? result.secure_url : undefined
  };
};

const uploadCommunityAttachment = async (file, folder = 'aurex/community/attachments') => {
  const result = await uploadFile(file.buffer, {
    folder,
    resourceType: 'raw',
    public_id: `community_doc_${Date.now()}_${Math.floor(Math.random() * 10000)}`
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    type: 'document',
    name: file.originalname
  };
};

/**
 * @desc    Create a new community post
 * @route   POST /api/community/posts
 * @access  Private
 */
exports.createPost = async (req, res) => {
  try {
    const {
      title,
      category = 'notice',
      description,
      locationName,
      eventDate,
      priority = 'normal',
      allowComments = true,
      content,
      media = [],
      attachments = [],
      isAnonymous = false,
      isAnnouncement = false,
      isStory = false,
      relatedReportId
    } = req.body;

    const safeMedia = Array.isArray(media) ? media : [];
    const safeAttachments = Array.isArray(attachments) ? attachments : [];
    const hasText = typeof content === 'string' && content.trim().length > 0;
    const hasMedia = safeMedia.length > 0;
    const hasAttachments = safeAttachments.length > 0;

    // Validation
    if (!hasText && !hasMedia && !hasAttachments) {
      return res.status(400).json({
        success: false,
        message: 'Please provide content or media'
      });
    }

    if (!isStory && (title || category || description || locationName || eventDate || priority) && (!title || !category || !description)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, and description'
      });
    }

    // Only admins can create announcements
    if (isAnnouncement && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create announcements'
      });
    }

    // Verify related report if provided
    let relatedReport = null;
    if (relatedReportId) {
      relatedReport = await Report.findById(relatedReportId);
      if (!relatedReport) {
        return res.status(404).json({
          success: false,
          message: 'Related report not found'
        });
      }
    }

    // Create post
    const post = await CommunityPost.create({
      title,
      category,
      description,
      locationName,
      eventDate,
      priority,
      allowComments,
      content: hasText ? content : 'Story',
      media: safeMedia,
      attachments: safeAttachments,
      author: req.user._id,
      isAnonymous,
      isAnnouncement,
      isStory,
      relatedReport: relatedReportId || null
    });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post: populatedPost
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

/**
 * @desc    Get community feed
 * @route   GET /api/community/feed
 * @access  Private
 */
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await CommunityPost.getFeed({
      page: parseInt(page),
      limit: parseInt(limit),
      includeStories: true
    });

    await CommunityPost.populate(posts, [
      { path: 'comments.user', select: 'name avatar' }
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feed',
      error: error.message
    });
  }
};

/**
 * @desc    Get stories
 * @route   GET /api/community/stories
 * @access  Private
 */
exports.getStories = async (req, res) => {
  try {
    const stories = await CommunityPost.getStories()
      .populate('views.user', 'name avatar');

    res.status(200).json({
      success: true,
      data: {
        stories
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stories',
      error: error.message
    });
  }
};

/**
 * @desc    Get announcements
 * @route   GET /api/community/announcements
 * @access  Public
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const announcements = await CommunityPost.getAnnouncements(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        announcements
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

/**
 * @desc    Get single post
 * @route   GET /api/community/posts/:id
 * @access  Private
 */
exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id)
      .populate('author', 'name avatar role')
      .populate('comments.user', 'name avatar')
      .populate('relatedReport', 'reportId title status');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/community/posts/:id
 * @access  Private (Author or Admin)
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      description,
      locationName,
      eventDate,
      priority,
      allowComments,
      content,
      media,
      attachments
    } = req.body;

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    if (title !== undefined) post.title = title;
    if (category !== undefined) post.category = category;
    if (description !== undefined) post.description = description;
    if (locationName !== undefined) post.locationName = locationName;
    if (eventDate !== undefined) post.eventDate = eventDate;
    if (priority !== undefined) post.priority = priority;
    if (allowComments !== undefined) post.allowComments = allowComments;
    post.content = content || post.content;
    if (media) post.media = media;
    if (attachments) post.attachments = attachments;
    await post.save();

    const updatedPost = await CommunityPost.findById(id)
      .populate('author', 'name avatar role');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message
    });
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/community/posts/:id
 * @access  Private (Author or Admin)
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await CommunityPost.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};

/**
 * @desc    Like/unlike post
 * @route   POST /api/community/posts/:id/like
 * @access  Private
 */
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      await post.removeLike(userId);
      res.status(200).json({
        success: true,
        message: 'Like removed',
        data: { liked: false, likeCount: post.likeCount }
      });
    } else {
      await post.addLike(userId);
      res.status(200).json({
        success: true,
        message: 'Post liked',
        data: { liked: true, likeCount: post.likeCount }
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing like',
      error: error.message
    });
  }
};

/**
 * @desc    Add comment to post
 * @route   POST /api/community/posts/:id/comments
 * @access  Private
 */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isAnonymous = false } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comment content'
      });
    }

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.allowComments === false) {
      return res.status(403).json({
        success: false,
        message: 'Comments are disabled for this post'
      });
    }

    await post.addComment(req.user._id, content, isAnonymous);

    const updatedPost = await CommunityPost.findById(id)
      .populate('comments.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comments: updatedPost.comments
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/community/posts/:postId/comments/:commentId
 * @access  Private (Comment author or Admin)
 */
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    const isAuthor = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await post.removeComment(commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

/**
 * @desc    Report post
 * @route   POST /api/community/posts/:id/report
 * @access  Private
 */
exports.reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for reporting'
      });
    }

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.report(req.user._id, reason);

    res.status(200).json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting post',
      error: error.message
    });
  }
};

/**
 * @desc    Pin/unpin post (Admin only)
 * @route   PUT /api/community/posts/:id/pin
 * @access  Private (Admin only)
 */
exports.pinPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isPinned = isPinned;
    await post.save();

    res.status(200).json({
      success: true,
      message: isPinned ? 'Post pinned' : 'Post unpinned',
      data: { isPinned }
    });
  } catch (error) {
    console.error('Pin post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error pinning post',
      error: error.message
    });
  }
};

/**
 * @desc    Share post
 * @route   POST /api/community/posts/:id/share
 * @access  Private
 */
exports.sharePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await CommunityPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.incrementShares();

    res.status(200).json({
      success: true,
      message: 'Post shared',
      data: { shareCount: post.shares }
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing post',
      error: error.message
    });
  }
};

/**
 * @desc    Add a story view
 * @route   POST /api/community/stories/:id/view
 * @access  Private
 */
exports.addStoryView = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await CommunityPost.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    if (!story.isStory) {
      return res.status(400).json({
        success: false,
        message: 'Not a story'
      });
    }

    await story.addView(req.user._id);

    const updatedStory = await CommunityPost.findById(id)
      .populate('views.user', 'name avatar');

    res.status(200).json({
      success: true,
      data: {
        story: updatedStory
      }
    });
  } catch (error) {
    console.error('Add story view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating story view',
      error: error.message
    });
  }
};

/**
 * @desc    Upload a single community image/video
 * @route   POST /api/community/upload/single
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

    const media = await uploadCommunityMedia(req.file);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: { media }
    });
  } catch (error) {
    console.error('Community media upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

/**
 * @desc    Upload community attachments (documents)
 * @route   POST /api/community/upload/attachments
 * @access  Private
 */
exports.uploadAttachments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const attachments = await Promise.all(
      req.files.map((file) => uploadCommunityAttachment(file))
    );

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: { attachments }
    });
  } catch (error) {
    console.error('Community attachment upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
};
