const crypto = require('crypto');
const fs = require('fs').promises;

/**
 * Generate SHA-256 hash from image buffer
 * @param {Buffer} buffer - Image buffer
 * @returns {String} - Hex hash string
 */
exports.generateImageHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Generate SHA-256 hash from image file path
 * @param {String} filePath - Path to image file
 * @returns {Promise<String>} - Hex hash string
 */
exports.generateImageHashFromFile = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  } catch (error) {
    throw new Error(`Failed to generate hash from file: ${error.message}`);
  }
};

/**
 * Check if an image hash already exists in the database
 * @param {Model} Model - Mongoose model
 * @param {String} hashField - Field name to check (e.g., 'collegeIdCardHash')
 * @param {String} hashValue - Hash value to check
 * @returns {Promise<Boolean>} - True if duplicate exists
 */
exports.checkDuplicateHash = async (Model, hashField, hashValue) => {
  const query = { [hashField]: hashValue };
  const existingRecord = await Model.findOne(query);
  return !!existingRecord;
};

/**
 * Check multiple fields for duplicates
 * @param {Model} Model - Mongoose model
 * @param {Object} checks - Object with field names and values to check
 * @returns {Promise<Object>} - Object with duplicate status and field name
 */
exports.checkMultipleDuplicates = async (Model, checks) => {
  for (const [fieldName, value] of Object.entries(checks)) {
    if (value) { // Only check if value exists
      const query = { [fieldName]: value };
      const existingRecord = await Model.findOne(query);
      if (existingRecord) {
        return {
          isDuplicate: true,
          field: fieldName,
          message: getDuplicateMessage(fieldName)
        };
      }
    }
  }
  return { isDuplicate: false };
};

/**
 * Get user-friendly message for duplicate field
 * @param {String} fieldName - Field name that has duplicate
 * @returns {String} - User-friendly error message
 */
function getDuplicateMessage(fieldName) {
  const messages = {
    regNumber: 'This roll number is already registered',
    collegeIdCardHash: 'This College ID Card has already been used for registration',
    selfieHash: 'This selfie has already been used for registration'
  };
  return messages[fieldName] || 'Student already registered with these credentials';
}
