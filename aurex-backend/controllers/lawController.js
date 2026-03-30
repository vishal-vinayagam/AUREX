/**
 * Law Controller - AUREX Civic Issue Reporting System
 * 
 * Handles law/acts management, search, and retrieval operations.
 */

const Law = require('../models/Law');

/**
 * @desc    Create a new law
 * @route   POST /api/laws
 * @access  Private (Admin only)
 */
exports.createLaw = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      subcategory,
      summary,
      keyPoints = [],
      actNumber,
      year,
      jurisdiction = 'central',
      applicableStates = [],
      penalties = [],
      relatedLaws = [],
      references = [],
      tags = [],
      isFeatured = false,
      isActive = true,
      priority = 0,
      translations = []
    } = req.body;

    // Validation
    if (!title || !description || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, content, and category'
      });
    }

    // Create law
    const law = await Law.create({
      title,
      description,
      content,
      category,
      subcategory,
      summary,
      keyPoints,
      actNumber,
      year,
      jurisdiction,
      applicableStates,
      penalties,
      relatedLaws,
      references,
      tags,
      isFeatured,
      isActive,
      priority,
      translations,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Law created successfully',
      data: {
        law
      }
    });
  } catch (error) {
    console.error('Create law error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating law',
      error: error.message
    });
  }
};

/**
 * @desc    Get all laws with filtering
 * @route   GET /api/laws
 * @access  Public
 */
exports.getLaws = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      isFeatured,
      sortBy = 'priority',
      sortOrder = 'desc'
    } = req.query;

    let query = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sort = {};
    if (search) {
      sort = { score: { $meta: 'textScore' } };
    }
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let lawsQuery = Law.find(query).sort(sort).skip(skip).limit(parseInt(limit));

    if (search) {
      lawsQuery = lawsQuery.select({ score: { $meta: 'textScore' } });
    }

    const [laws, total] = await Promise.all([
      lawsQuery.lean(),
      Law.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        laws,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get laws error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching laws',
      error: error.message
    });
  }
};

/**
 * @desc    Get single law by ID
 * @route   GET /api/laws/:id
 * @access  Public
 */
exports.getLaw = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const law = await Law.findById(id)
      .populate('relatedLaws', 'title description category')
      .populate('createdBy', 'name');

    if (!law) {
      return res.status(404).json({
        success: false,
        message: 'Law not found'
      });
    }

    // Increment view count
    await law.incrementViews();

    // Get translation if requested
    const translation = law.getTranslation(lang);

    res.status(200).json({
      success: true,
      data: {
        law: {
          ...law.toObject(),
          ...translation
        }
      }
    });
  } catch (error) {
    console.error('Get law error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching law',
      error: error.message
    });
  }
};

/**
 * @desc    Update law
 * @route   PUT /api/laws/:id
 * @access  Private (Admin only)
 */
exports.updateLaw = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.lawId;
    delete updateData.createdBy;

    updateData.updatedBy = req.user._id;

    const law = await Law.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!law) {
      return res.status(404).json({
        success: false,
        message: 'Law not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Law updated successfully',
      data: {
        law
      }
    });
  } catch (error) {
    console.error('Update law error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating law',
      error: error.message
    });
  }
};

/**
 * @desc    Delete law (soft delete)
 * @route   DELETE /api/laws/:id
 * @access  Private (Admin only)
 */
exports.deleteLaw = async (req, res) => {
  try {
    const { id } = req.params;

    const law = await Law.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: req.user._id },
      { new: true }
    );

    if (!law) {
      return res.status(404).json({
        success: false,
        message: 'Law not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Law deleted successfully'
    });
  } catch (error) {
    console.error('Delete law error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting law',
      error: error.message
    });
  }
};

/**
 * @desc    Search laws
 * @route   GET /api/laws/search
 * @access  Public
 */
exports.searchLaws = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20, lang = 'en' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const laws = await Law.search(q, {
      category,
      language: lang,
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.status(200).json({
      success: true,
      data: {
        laws,
        query: q,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search laws error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching laws',
      error: error.message
    });
  }
};

/**
 * @desc    Get laws by category
 * @route   GET /api/laws/category/:category
 * @access  Public
 */
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const laws = await Law.getByCategory(category, {
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.status(200).json({
      success: true,
      data: {
        laws,
        category,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get laws by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching laws by category',
      error: error.message
    });
  }
};

/**
 * @desc    Get featured laws
 * @route   GET /api/laws/featured
 * @access  Public
 */
exports.getFeatured = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const laws = await Law.getFeatured(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        laws
      }
    });
  } catch (error) {
    console.error('Get featured laws error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured laws',
      error: error.message
    });
  }
};

/**
 * @desc    Get law categories
 * @route   GET /api/laws/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'civic_rights', name: 'Civic Rights', nameTa: 'குடியுரிமைகள்', nameHi: 'नागरिक अधिकार' },
      { id: 'municipal_laws', name: 'Municipal Laws', nameTa: 'நகராட்சி சட்டங்கள்', nameHi: 'नगर पालिका कानून' },
      { id: 'environment', name: 'Environment', nameTa: 'சுற்றுச்சூழல்', nameHi: 'पर्यावरण' },
      { id: 'public_safety', name: 'Public Safety', nameTa: 'பொதுப் பாதுகாப்பு', nameHi: 'सार्वजनिक सुरक्षा' },
      { id: 'consumer_protection', name: 'Consumer Protection', nameTa: 'நுகர்வோர் பாதுகாப்பு', nameHi: 'उपभोक्ता संरक्षण' },
      { id: 'traffic_rules', name: 'Traffic Rules', nameTa: 'போக்குவரத்து விதிகள்', nameHi: 'यातायात नियम' },
      { id: 'building_regulations', name: 'Building Regulations', nameTa: 'கட்டிட விதிமுறைகள்', nameHi: 'निर्माण विनियम' },
      { id: 'health_sanitation', name: 'Health & Sanitation', nameTa: 'சுகாதாரம்', nameHi: 'स्वास्थ्य और स्वच्छता' },
      { id: 'education', name: 'Education', nameTa: 'கல்வி', nameHi: 'शिक्षा' },
      { id: 'employment', name: 'Employment', nameTa: 'வேலைவாய்ப்பு', nameHi: 'रोजगार' },
      { id: 'other', name: 'Other', nameTa: 'மற்றவை', nameHi: 'अन्य' }
    ];

    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};
