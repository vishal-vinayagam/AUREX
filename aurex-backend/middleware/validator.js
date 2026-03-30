/**
 * Validator Middleware - AUREX Civic Issue Reporting System
 * 
 * Common validation functions and middleware.
 */

/**
 * Validate email format
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits)
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
exports.isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

/**
 * Validate coordinates [longitude, latitude]
 */
exports.isValidCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  
  const [longitude, latitude] = coordinates;
  
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

/**
 * Validate required fields
 */
exports.validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of fields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        errorCode: 'MISSING_FIELDS'
      });
    }
    
    next();
  };
};

/**
 * Sanitize string input
 */
exports.sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate pagination parameters
 */
exports.validatePagination = (req, res, next) => {
  let { page, limit } = req.query;
  
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  
  // Max limit
  if (limit > 100) {
    limit = 100;
  }
  
  req.query.page = page;
  req.query.limit = limit;
  
  next();
};

/**
 * Validate report category
 */
exports.isValidReportCategory = (category) => {
  const validCategories = [
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
  ];
  
  return validCategories.includes(category);
};

/**
 * Validate priority level
 */
exports.isValidPriority = (priority) => {
  const validPriorities = ['low', 'medium', 'high', 'emergency'];
  return validPriorities.includes(priority);
};

/**
 * Validate report status
 */
exports.isValidStatus = (status) => {
  const validStatuses = [
    'pending',
    'under_review',
    'in_progress',
    'resolved',
    'rejected',
    'escalated'
  ];
  return validStatuses.includes(status);
};

/**
 * Validate language code
 */
exports.isValidLanguage = (lang) => {
  const validLanguages = ['en', 'ta', 'hi'];
  return validLanguages.includes(lang);
};