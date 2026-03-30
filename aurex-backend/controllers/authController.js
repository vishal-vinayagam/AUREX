/**
 * Authentication Controller - AUREX Civic Issue Reporting System
 * 
 * Handles user authentication including registration, login, logout,
 * password reset, and token management using JWT.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadFile } = require('../config/cloudinary');

/**
 * Generate JWT Token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate Refresh Token
 * @param {string} userId - User ID to encode in token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const normalizedEmail = email?.toLowerCase?.().trim();
    const normalizedPhone = phone?.trim?.();

    // Validation
    if (!name || !normalizedEmail || !normalizedPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Validate phone number format (10 digits)
    if (!/^[0-9]{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const isAdminEmail = normalizedEmail.endsWith('@aurex.com');

    // Create new user
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: isAdminEmail ? 'admin' : 'user'
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toPublicProfile(),
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const messageMap = {
        email: 'User with this email already exists',
        phone: 'User with this phone number already exists',
        firebaseUid: 'User with this Firebase account already exists'
      };

      return res.status(409).json({
        success: false,
        message: messageMap[duplicateField] || 'User already exists'
      });
    }

    if (error?.name === 'ValidationError') {
      const firstError = Object.values(error.errors || {})[0];
      return res.status(400).json({
        success: false,
        message: firstError?.message || 'Invalid registration data'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update FCM token if provided (for push notifications)
    if (fcmToken) {
      user.fcmToken = fcmToken;
    }

    // enforce role based on email domain
    const normalizedEmail = user.email.toLowerCase().trim();
    const shouldBeAdmin = normalizedEmail.endsWith('@aurex.com');
    if (shouldBeAdmin && user.role !== 'admin') {
      user.role = 'admin';
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toPublicProfile(),
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // Clear FCM token if provided
    const { fcmToken } = req.body;
    
    if (fcmToken && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $unset: { fcmToken: 1 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (with refresh token)
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'
    );

    // Check if it's a refresh token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, preferences, avatar } = req.body;

    // Build update object with only allowed fields
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) {
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit phone number'
        });
      }
      updateData.phone = phone;
    }
    if (address) updateData.address = address;
    if (preferences) updateData.preferences = preferences;
    if (avatar) updateData.avatar = avatar;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/auth/upload/avatar
 * @access  Private
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('Uploading avatar for user:', req.user._id);

    const result = await uploadFile(req.file.buffer, {
      folder: 'aurex/avatars',
      resourceType: 'image',
      public_id: `avatar_${Date.now()}_${req.user._id}`
    });

    console.log('Cloudinary upload successful:', result.secure_url);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    if (!user) {
      console.error('User not found after avatar update:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar updated',
      data: {
        user: user.toPublicProfile()
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar: ' + (error.message || 'Unknown error'),
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentValid = await user.comparePassword(currentPassword);

    if (!isCurrentValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

/**
 * @desc    Forgot password - Send reset link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '1h' }
    );

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If an account exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};
