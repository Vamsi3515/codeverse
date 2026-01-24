/**
 * Email Validation Utility
 * Validates college emails by blocking public email providers
 */

// List of blocked public email domains
const blockedDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'aol.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'inbox.com',
  'live.com',
  'msn.com',
  'ymail.com',
  'rediffmail.com',
];

/**
 * Validate if email is a college-issued email
 * @param {string} email - Email address to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
exports.validateCollegeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Invalid email format',
    };
  }

  // Convert to lowercase for case-insensitive comparison
  const normalizedEmail = email.toLowerCase().trim();

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return {
      isValid: false,
      message: 'Invalid email format',
    };
  }

  // Extract domain
  const parts = normalizedEmail.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      message: 'Invalid email format',
    };
  }

  const domain = parts[1];

  // Check if domain is missing
  if (!domain) {
    return {
      isValid: false,
      message: 'Invalid email format',
    };
  }

  // Check if domain is in blocked list
  if (blockedDomains.includes(domain)) {
    return {
      isValid: false,
      message: 'Please use your college-issued email address. Personal email providers are not allowed.',
    };
  }

  // Email is valid - it's not a public domain
  return {
    isValid: true,
    message: 'College email validated successfully',
    domain: domain,
  };
};

/**
 * Check if email domain is blocked
 * @param {string} email - Email address to check
 * @returns {boolean} - true if blocked, false otherwise
 */
exports.isPublicEmailDomain = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const domain = normalizedEmail.split('@')[1];

  return blockedDomains.includes(domain);
};

/**
 * Get list of blocked domains
 * @returns {array} - Array of blocked domain names
 */
exports.getBlockedDomains = () => {
  return [...blockedDomains];
};

/**
 * Extract domain from email
 * @param {string} email - Email address
 * @returns {string|null} - Domain name or null
 */
exports.extractDomain = (email) => {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const parts = normalizedEmail.split('@');

  return parts.length === 2 ? parts[1] : null;
};
