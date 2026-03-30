/**
 * Contact Controller - AUREX Civic Issue Reporting System
 * 
 * Handles emergency contacts, helplines, and official contact management.
 */

const Contact = require('../models/Contact');

/**
 * @desc    Create a new contact
 * @route   POST /api/contacts
 * @access  Private (Admin only)
 */
exports.createContact = async (req, res) => {
  try {
    const {
      name,
      category,
      role,
      subcategory,
      description,
      phoneNumbers = [],
      emails = [],
      address,
      location,
      website,
      isEmergency = false,
      priority = 0,
      jurisdiction = 'local',
      applicableLocations = [],
      operatingHours,
      services = [],
      languages = [],
      icon
    } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and category'
      });
    }

    if (phoneNumbers.length === 0 && emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one phone number or email'
      });
    }

    // Create contact
    const contact = await Contact.create({
      name,
      category,
      role,
      subcategory,
      description,
      phoneNumbers,
      emails,
      address,
      location,
      website,
      isEmergency,
      priority,
      jurisdiction,
      applicableLocations,
      operatingHours,
      services,
      languages,
      icon,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating contact',
      error: error.message
    });
  }
};

/**
 * @desc    Get all contacts with filtering
 * @route   GET /api/contacts
 * @access  Public
 */
exports.getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      isEmergency,
      search,
      city,
      state
    } = req.query;

    let query = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (isEmergency !== undefined) query.isEmergency = isEmergency === 'true';
    if (city) query['applicableLocations.city'] = { $regex: city, $options: 'i' };
    if (state) query['applicableLocations.state'] = { $regex: state, $options: 'i' };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let contactsQuery = Contact.find(query)
      .sort({ isEmergency: -1, priority: -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (search) {
      contactsQuery = contactsQuery.select({ score: { $meta: 'textScore' } });
    }

    const [contacts, total] = await Promise.all([
      contactsQuery.lean(),
      Contact.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single contact
 * @route   GET /api/contacts/:id
 * @access  Public
 */
exports.getContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Increment view count
    await contact.incrementViews();

    res.status(200).json({
      success: true,
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message
    });
  }
};

/**
 * @desc    Update contact
 * @route   PUT /api/contacts/:id
 * @access  Private (Admin only)
 */
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;

    updateData.updatedBy = req.user._id;

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message
    });
  }
};

/**
 * @desc    Delete contact (soft delete)
 * @route   DELETE /api/contacts/:id
 * @access  Private (Admin only)
 */
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: req.user._id },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message
    });
  }
};

/**
 * @desc    Get emergency contacts
 * @route   GET /api/contacts/emergency
 * @access  Public
 */
exports.getEmergencyContacts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const contacts = await Contact.getEmergencyContacts(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        contacts
      }
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts',
      error: error.message
    });
  }
};

/**
 * @desc    Get contacts by category
 * @route   GET /api/contacts/category/:category
 * @access  Public
 */
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const contacts = await Contact.getByCategory(category, {
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.status(200).json({
      success: true,
      data: {
        contacts,
        category
      }
    });
  } catch (error) {
    console.error('Get contacts by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts by category',
      error: error.message
    });
  }
};

/**
 * @desc    Search contacts
 * @route   GET /api/contacts/search
 * @access  Public
 */
exports.searchContacts = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const contacts = await Contact.search(q, {
      category,
      limit: parseInt(limit),
      page: parseInt(page)
    });

    res.status(200).json({
      success: true,
      data: {
        contacts,
        query: q
      }
    });
  } catch (error) {
    console.error('Search contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching contacts',
      error: error.message
    });
  }
};

/**
 * @desc    Get nearby contacts
 * @route   GET /api/contacts/nearby
 * @access  Public
 */
exports.getNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 10000, category, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const maxDistance = parseInt(radius);

    const contacts = await Contact.findNearby(coordinates, maxDistance, {
      category,
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: {
        contacts,
        count: contacts.length
      }
    });
  } catch (error) {
    console.error('Get nearby contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby contacts',
      error: error.message
    });
  }
};

/**
 * @desc    Get contact categories
 * @route   GET /api/contacts/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'emergency', name: 'Emergency', nameTa: 'அவசரம்', nameHi: 'आपातकालीन', icon: 'Phone' },
      { id: 'healthcare', name: 'Healthcare', nameTa: 'சுகாதாரம்', nameHi: 'स्वास्थ्य सेवा', icon: 'Heart' },
      { id: 'utilities', name: 'Utilities', nameTa: 'பயன்பாடுகள்', nameHi: 'उपयोगिताएं', icon: 'Zap' },
      { id: 'municipal', name: 'Municipal', nameTa: 'நகராட்சி', nameHi: 'नगर पालिका', icon: 'Building' },
      { id: 'police', name: 'Police', nameTa: 'காவல்துறை', nameHi: 'पुलिस', icon: 'Shield' },
      { id: 'fire', name: 'Fire Department', nameTa: 'தீயணைப்பு', nameHi: 'फायर विभाग', icon: 'Flame' },
      { id: 'disaster', name: 'Disaster Management', nameTa: 'பேரிடர் மேலாண்மை', nameHi: 'आपदा प्रबंधन', icon: 'AlertTriangle' },
      { id: 'women_safety', name: 'Women Safety', nameTa: 'மகளிர் பாதுகாப்பு', nameHi: 'महिला सुरक्षा', icon: 'Users' },
      { id: 'child_safety', name: 'Child Safety', nameTa: 'குழந்தை பாதுகாப்பு', nameHi: 'बाल सुरक्षा', icon: 'Baby' },
      { id: 'senior_citizen', name: 'Senior Citizen', nameTa: 'மூத்த குடிமக்கள்', nameHi: 'वरिष्ठ नागरिक', icon: 'User' },
      { id: 'transport', name: 'Transport', nameTa: 'போக்குவரத்து', nameHi: 'परिवहन', icon: 'Bus' },
      { id: 'legal', name: 'Legal Aid', nameTa: 'சட்ட உதவி', nameHi: 'कानूनी सहायता', icon: 'Scale' },
      { id: 'consumer', name: 'Consumer Affairs', nameTa: 'நுகர்வோர் விவகாரங்கள்', nameHi: 'उपभोक्ता मामले', icon: 'ShoppingCart' },
      { id: 'corruption', name: 'Anti-Corruption', nameTa: 'ஊழல் எதிர்ப்பு', nameHi: 'भ्रष्टाचार विरोधी', icon: 'Flag' },
      { id: 'other', name: 'Other', nameTa: 'மற்றவை', nameHi: 'अन्य', icon: 'MoreHorizontal' }
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

/**
 * @desc    Record contact call
 * @route   POST /api/contacts/:id/call
 * @access  Private
 */
exports.recordCall = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    await contact.incrementCalls();

    res.status(200).json({
      success: true,
      message: 'Call recorded'
    });
  } catch (error) {
    console.error('Record call error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording call',
      error: error.message
    });
  }
};