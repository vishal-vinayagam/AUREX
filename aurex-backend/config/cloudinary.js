/**
 * Cloudinary Configuration - AUREX Civic Issue Reporting System
 * 
 * Cloudinary setup for image and video uploads.
 */

const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary
 */
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  console.log('Cloudinary configured');
  return cloudinary;
};

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadFile = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'aurex',
      resource_type: options.resourceType || 'auto',
      ...options
    };

    console.log('Cloudinary upload options:', {
      folder: uploadOptions.folder,
      resource_type: uploadOptions.resource_type,
      public_id: uploadOptions.public_id
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload successful, URL:', result.secure_url);
          resolve(result);
        }
      }
    );

    uploadStream.on('error', (error) => {
      console.error('Cloudinary stream error event:', error);
      reject(error);
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Generate optimized URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
  const transformation = [];

  if (options.width) {
    transformation.push({ width: options.width, crop: 'limit' });
  }

  if (options.height) {
    transformation.push({ height: options.height, crop: 'limit' });
  }

  if (options.quality) {
    transformation.push({ quality: options.quality });
  }

  if (options.format) {
    transformation.push({ fetch_format: options.format });
  }

  return cloudinary.url(publicId, {
    transformation,
    secure: true
  });
};

module.exports = {
  configureCloudinary,
  uploadFile,
  deleteFile,
  getOptimizedUrl,
  cloudinary
};