/**
 * Request Validation Middleware
 * Validates incoming requests before they reach controllers
 */

const validation = require('../utils/fieldValidation');

// Validate student registration request
exports.validateStudentReg = (req, res, next) => {
  const { firstName, lastName, email, phone, password, college, regNumber } = req.body;

  const result = validation.validateStudentRegistration({
    firstName,
    lastName,
    email,
    phone,
    password,
    college,
    regNumber
  });

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  next();
};

// Validate organizer registration request
exports.validateOrganizerReg = (req, res, next) => {
  const { firstName, lastName, email, phone, password, college } = req.body;

  const result = validation.validateOrganizerRegistration({
    firstName,
    lastName,
    email,
    phone,
    password,
    college
  });

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  next();
};

// Validate hackathon creation request
exports.validateHackathonCreate = (req, res, next) => {
  const {
    title,
    mode,
    registrationFee,
    participationType,
    minTeamSize,
    maxTeamSize,
    startDate,
    endDate,
    location,
    maxParticipants
  } = req.body;

  const result = validation.validateHackathonCreation({
    title,
    mode,
    registrationFee,
    participationType,
    minTeamSize,
    maxTeamSize,
    startDate,
    endDate,
    location,
    maxParticipants
  });

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  next();
};

// Validate hackathon registration request
exports.validateHackathonReg = (req, res, next) => {
  // Skipping validation as per user request to remove all validations
  next();

  /*
  const { hackathonId, participationType, teamData } = req.body;

  const result = validation.validateHackathonRegistration({
    hackathonId,
    participationType,
    teamData
  });

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  next();
  */
};

// Validate QR verification request
exports.validateQRVerify = (req, res, next) => {
  const { registrationId } = req.body;

  const result = validation.validateQRVerification({
    registrationId
  });

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  next();
};

// Validate file upload (selfie)
exports.validateSelfieUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Selfie image is required']
    });
  }

  const result = validation.validateSelfie(req.file);

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  next();
};

// Validate file upload (college ID card)
exports.validateCollegeIdUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['College ID card is required']
    });
  }

  const result = validation.validateCollegeIdCard(req.file);

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.errors
    });
  }

  next();
};

// Generic field validator
exports.validateField = (fieldName, validatorFn, errorMessage) => {
  return (req, res, next) => {
    const value = req.body[fieldName];

    if (!validatorFn(value)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [errorMessage || `Invalid ${fieldName}`]
      });
    }

    next();
  };
};

// Validate required fields
exports.validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const errors = [];

    requiredFields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Validate date range
exports.validateDateRange = (startDateField, endDateField) => {
  return (req, res, next) => {
    const startDate = new Date(req.body[startDateField]);
    const endDate = new Date(req.body[endDateField]);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Invalid date format']
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [`${endDateField} must be after ${startDateField}`]
      });
    }

    next();
  };
};

// Validate numeric range
exports.validateNumericRange = (fieldName, min, max) => {
  return (req, res, next) => {
    const value = parseFloat(req.body[fieldName]);

    if (isNaN(value) || value < min || value > max) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [`${fieldName} must be between ${min} and ${max}`]
      });
    }

    next();
  };
};
