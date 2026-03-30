/**
 * Error Handler Middleware - AUREX Civic Issue Reporting System
 * 
 * Centralized error handling for the application.
 */

/**
 * Custom error class for API errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 409, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = messages.join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = new AppError(message, 400, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new AppError(message, 400, 'UNEXPECTED_FILE');
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errorCode: error.errorCode || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route not found - ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Async handler wrapper to catch errors in async functions
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler
};