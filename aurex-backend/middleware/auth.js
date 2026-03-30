/**
 * Authentication Middleware - AUREX Civic Issue Reporting System
 * 
 * Handles JWT verification, role-based access control, and user authentication.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and attach user to request
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (alternative)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );

      // Find user by ID
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account has been deactivated'
        });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * Restrict access to admin users only
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized. Admin access required.'
    });
  }

  next();
};

/**
 * Restrict access to superadmin users only
 */
exports.superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized. Superadmin access required.'
    });
  }

  next();
};

/**
 * Optional authentication - attaches user if token exists, but doesn't require it
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );

      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Invalid token, continue without user
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Check if user owns the resource or is admin
 */
exports.authorizeOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized'
        });
      }

      const resourceUserId = await getResourceUserId(req);
      const isOwner = resourceUserId && resourceUserId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Error in authorization'
      });
    }
  };
};