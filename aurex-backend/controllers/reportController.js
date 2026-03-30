/**
 * Report Controller - AUREX Civic Issue Reporting System
 * 
 * Handles all report-related operations including creation, retrieval,
 * updates, status changes, and statistics.
 */

const Report = require('../models/Report');
const User = require('../models/User');
const { uploadFile } = require('../config/cloudinary');

/**
 * Parse boolean values sent from JSON or multipart form fields.
 */
const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
};

/**
 * Parse location from JSON body or multipart string field.
 */
const parseLocation = (rawLocation) => {
  if (!rawLocation) return null;
  if (typeof rawLocation === 'object') return rawLocation;

  try {
    return JSON.parse(rawLocation);
  } catch (error) {
    return null;
  }
};

const parseMediaArray = (rawMedia) => {
  if (!rawMedia) return [];
  if (Array.isArray(rawMedia)) return rawMedia;

  if (typeof rawMedia === 'string') {
    try {
      const parsed = JSON.parse(rawMedia);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const parseJsonObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }
  return {};
};

const categoryFieldRules = {
  roads: ['problemType', 'roadName', 'landmark', 'damageSize', 'accidentRisk'],
  water_supply: ['issueType', 'areaName', 'duration', 'waterQuality'],
  electricity: ['issueType', 'areaName', 'poleNumber', 'duration', 'dangerous'],
  sanitation: ['issueType', 'areaName', 'smellLevel', 'healthRisk'],
  garbage: ['garbageType', 'areaName', 'collectionDelayDays', 'spreading'],
  streetlights: ['poleNumber', 'lightCondition', 'areaName', 'sinceWhen'],
  public_transport: ['transportType', 'vehicleNumber', 'route', 'stopName', 'incidentTime', 'issueType'],
  parks: ['parkName', 'issueType', 'areaName', 'safetyConcern'],
  noise_pollution: ['noiseSource', 'timeOfDay', 'duration', 'areaName'],
  air_pollution: ['pollutionSource', 'areaName', 'breathingDifficulty'],
  illegal_construction: ['constructionType', 'location', 'blockingPublicPath', 'sinceWhen'],
  traffic: ['issueType', 'roadName', 'peakTime', 'accidentRisk'],
  safety: ['issueType', 'location', 'time', 'emergencyLevel'],
  healthcare: ['facilityName', 'issueType', 'areaName', 'emergency'],
  education: ['institutionName', 'issueType', 'areaName'],
  other: ['customIssueType', 'areaName', 'additionalDetails']
};

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
};

const validateCategoryDetails = (category, details = {}) => {
  const requiredFields = categoryFieldRules[category];
  if (!requiredFields || requiredFields.length === 0) return [];
  return requiredFields.filter((field) => isEmptyValue(details[field]));
};

/**
 * Upload multer files to Cloudinary and map them to report media schema.
 */
const uploadMediaFiles = async (files = []) => {
  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const result = await uploadFile(file.buffer, {
        folder: 'aurex/reports',
        resourceType: 'auto',
        public_id: `report_${Date.now()}_${index}`
      });

      return {
        url: result.secure_url,
        type: result.resource_type === 'video' ? 'video' : 'image',
        publicId: result.public_id,
        thumbnail: result.resource_type === 'video' ? result.secure_url : undefined
      };
    })
  );

  return uploads;
};

const getReadableUploadError = (error) => {
  if (!error) return 'Unknown upload error';
  if (error.error?.message) return error.error.message;
  if (error.message) return error.message;
  if (Array.isArray(error.errors) && error.errors[0]?.message) return error.errors[0].message;
  return 'Failed to upload media to Cloudinary';
};

/**
 * @desc    Create a new report
 * @route   POST /api/reports
 * @access  Private
 */
exports.createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      categoryDetails,
      incidentAt,
      priority = 'medium',
      isEmergency = false,
      location,
      media = [],
      isAnonymous = false,
      isPublic = true,
      contactName,
      contactPhone
    } = req.body;

    const parsedLocation = parseLocation(location);
    const parsedIsEmergency = parseBoolean(isEmergency, false);
    const parsedIsAnonymous = parseBoolean(isAnonymous, false);
    const parsedIsPublic = parseBoolean(isPublic, true);
    const existingMedia = parseMediaArray(media);
    const parsedCategoryDetails = parseJsonObject(categoryDetails);
    const parsedIncidentAt = incidentAt ? new Date(incidentAt) : null;
    const uploadedMedia = req.files?.length ? await uploadMediaFiles(req.files) : [];
    const mergedMedia = [...existingMedia, ...uploadedMedia];

    // Validation
    if (!title || !description || !category || !parsedLocation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and location'
      });
    }

    // Validate location coordinates
    if (!parsedLocation.coordinates || parsedLocation.coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid location coordinates [longitude, latitude]'
      });
    }

    if (parsedIncidentAt && Number.isNaN(parsedIncidentAt.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date and time'
      });
    }

    const missingFields = validateCategoryDetails(category, parsedCategoryDetails);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide required category details: ${missingFields.join(', ')}`
      });
    }

    // Create report
    const report = await Report.create({
      title,
      description,
      category,
      subcategory,
      categoryDetails: parsedCategoryDetails,
      incidentAt: parsedIncidentAt || undefined,
      priority: parsedIsEmergency ? 'emergency' : priority,
      isEmergency: parsedIsEmergency,
      location: {
        type: 'Point',
        coordinates: parsedLocation.coordinates,
        address: parsedLocation.address,
        landmark: parsedLocation.landmark,
        pincode: parsedLocation.pincode
      },
      media: mergedMedia,
      reportedBy: req.user._id,
      contactName: contactName || '',
      contactPhone: contactPhone || '',
      isAnonymous: parsedIsAnonymous,
      isPublic: parsedIsPublic,
      statusHistory: [{
        status: 'pending',
        changedBy: req.user._id,
        note: 'Report submitted'
      }]
    });

    // Populate and return
    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        report: populatedReport
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: getReadableUploadError(error)
    });
  }
};

/**
 * @desc    Upload a single report image/video to Cloudinary
 * @route   POST /api/reports/upload/single
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

    const [media] = await uploadMediaFiles([req.file]);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: { media }
    });
  } catch (error) {
    console.error('Single media upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: getReadableUploadError(error)
    });
  }
};

/**
 * @desc    Upload multiple report images/videos to Cloudinary
 * @route   POST /api/reports/upload/multiple
 * @access  Private
 */
exports.uploadMultipleMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const media = await uploadMediaFiles(req.files);

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      data: { media }
    });
  } catch (error) {
    console.error('Multiple media upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: getReadableUploadError(error)
    });
  }
};

/**
 * @desc    Get all reports with filtering and pagination
 * @route   GET /api/reports
 * @access  Private (Admin: all, User: own reports)
 */
exports.getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      isEmergency,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      myReports = false
    } = req.query;

    // Build query
    const query = {};

    // If user is not admin and myReports is true, only show own reports
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      query.reportedBy = req.user._id;
    } else if (myReports === 'true') {
      query.reportedBy = req.user._id;
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isEmergency !== undefined) query.isEmergency = isEmergency === 'true';

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reportId: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reportedBy', 'name avatar')
        .populate('assignedTo', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

/**
 * @desc    Get single report by ID
 * @route   GET /api/reports/:id
 * @access  Private
 */
exports.getReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reportedBy', 'name avatar phone')
      .populate('assignedTo', 'name avatar')
      .populate('statusHistory.changedBy', 'name avatar role')
      .populate('adminResponses.respondedBy', 'name avatar role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user has permission to view
    const isOwner = report.reportedBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isOwner && !isAdmin && !report.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    // Increment view count
    if (!isOwner) {
      report.viewCount += 1;
      await report.save();
    }

    res.status(200).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

/**
 * @desc    Update report
 * @route   PUT /api/reports/:id
 * @access  Private (Owner or Admin)
 */
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    const isOwner = report.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Regular users can only update certain fields if report is still pending
    if (!isAdmin && report.status !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Cannot update report after it has been processed'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.reportedBy;
    delete updateData.reportId;
    delete updateData.status;
    delete updateData.statusHistory;
    delete updateData.adminResponses;

    if (updateData.incidentAt) {
      const parsedIncidentAt = new Date(updateData.incidentAt);
      if (Number.isNaN(parsedIncidentAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date and time'
        });
      }
      updateData.incidentAt = parsedIncidentAt;
    }

    if (updateData.categoryDetails) {
      const parsedCategoryDetails = parseJsonObject(updateData.categoryDetails);
      updateData.categoryDetails = parsedCategoryDetails;
      const effectiveCategory = updateData.category || report.category;
      const missingFields = validateCategoryDetails(effectiveCategory, parsedCategoryDetails);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Please provide required category details: ${missingFields.join(', ')}`
        });
      }
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report: updatedReport
      }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

/**
 * @desc    Update report status (Admin only)
 * @route   PUT /api/reports/:id/status
 * @access  Private (Admin only)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const validStatuses = ['pending', 'under_review', 'in_progress', 'resolved', 'rejected', 'escalated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Add status history and update status
    await report.addStatusHistory(status, req.user._id, note);

    const updatedReport = await Report.findById(id)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name avatar')
      .populate('statusHistory.changedBy', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: {
        report: updatedReport
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

/**
 * @desc    Assign report to admin
 * @route   PUT /api/reports/:id/assign
 * @access  Private (Admin only)
 */
exports.assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Verify admin exists
    if (adminId) {
      const admin = await User.findById(adminId);
      if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin user'
        });
      }
    }

    report.assignedTo = adminId || null;
    report.assignedAt = adminId ? new Date() : null;
    await report.save();

    const updatedReport = await Report.findById(id)
      .populate('reportedBy', 'name avatar')
      .populate('assignedTo', 'name avatar');

    res.status(200).json({
      success: true,
      message: adminId ? 'Report assigned successfully' : 'Report unassigned',
      data: {
        report: updatedReport
      }
    });
  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning report',
      error: error.message
    });
  }
};

/**
 * @desc    Add admin response to report
 * @route   POST /api/reports/:id/response
 * @access  Private (Admin only)
 */
exports.addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isInternal = false } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide response message'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.addAdminResponse(message, req.user._id, isInternal);

    const updatedReport = await Report.findById(id)
      .populate('reportedBy', 'name avatar')
      .populate('adminResponses.respondedBy', 'name avatar role');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: {
        report: updatedReport
      }
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response',
      error: error.message
    });
  }
};

/**
 * @desc    Submit user feedback for resolved report
 * @route   POST /api/reports/:id/feedback
 * @access  Private (Report owner only)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5)'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check ownership
    if (report.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this report'
      });
    }

    // Check if report is resolved
    if (report.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Can only submit feedback for resolved reports'
      });
    }

    report.userFeedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date()
    };
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedback: report.userFeedback
      }
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

/**
 * @desc    Upvote a report
 * @route   POST /api/reports/:id/upvote
 * @access  Private
 */
exports.upvoteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const userId = req.user._id;
    const hasUpvoted = report.upvotes.includes(userId);

    if (hasUpvoted) {
      await report.removeUpvote(userId);
      res.status(200).json({
        success: true,
        message: 'Upvote removed',
        data: { upvoted: false, upvoteCount: report.upvoteCount }
      });
    } else {
      await report.upvote(userId);
      res.status(200).json({
        success: true,
        message: 'Report upvoted',
        data: { upvoted: true, upvoteCount: report.upvoteCount }
      });
    }
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing upvote',
      error: error.message
    });
  }
};

/**
 * @desc    Delete report
 * @route   DELETE /api/reports/:id
 * @access  Private (Owner or Admin)
 */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    const isOwner = report.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

/**
 * @desc    Get report statistics
 * @route   GET /api/reports/stats/overview
 * @access  Private
 */
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Report.getStatistics();

    // Get additional stats
    const categoryStats = await Report.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Report.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const monthlyStats = await Report.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats,
        byCategory: categoryStats,
        byPriority: priorityStats,
        monthlyTrend: monthlyStats
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get nearby reports
 * @route   GET /api/reports/nearby
 * @access  Public
 */
exports.getNearbyReports = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const maxDistance = parseInt(radius);

    const reports = await Report.findNearby(coordinates, maxDistance)
      .populate('reportedBy', 'name avatar')
      .limit(parseInt(limit))
      .lean();

    // Filter to only show public reports unless admin
    const filteredReports = reports.filter(report => 
      report.isPublic || 
      (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin'))
    );

    res.status(200).json({
      success: true,
      data: {
        reports: filteredReports,
        count: filteredReports.length
      }
    });
  } catch (error) {
    console.error('Get nearby reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby reports',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's reports
 * @route   GET /api/reports/my-reports
 * @access  Private
 */
exports.getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { reportedBy: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('assignedTo', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Report.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
};
