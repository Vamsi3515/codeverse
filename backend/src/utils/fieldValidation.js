/**
 * Field Validation Utilities
 * Provides comprehensive validation for all key fields across the application
 */

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Phone number validation (basic international format)
const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

// Name validation (no special characters except spaces)
const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Roll number validation
const isValidRollNumber = (rollNumber) => {
  if (!rollNumber || typeof rollNumber !== 'string') return false;
  // Allow alphanumeric with hyphens, 3-20 chars
  const rollRegex = /^[a-zA-Z0-9\-]{3,20}$/;
  return rollRegex.test(rollNumber.trim());
};

// College name validation
const isValidCollege = (college) => {
  if (!college || typeof college !== 'string') return false;
  const collegeRegex = /^[a-zA-Z\s\&\.,'()-]{3,100}$/;
  return collegeRegex.test(college.trim());
};

// Password validation (min 6 chars, at least 1 letter & 1 number)
const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
};

// Hackathon title validation
const isValidHackathonTitle = (title) => {
  if (!title || typeof title !== 'string') return false;
  const titleRegex = /^[a-zA-Z0-9\s\-&.,'()]{3,100}$/;
  return titleRegex.test(title.trim());
};

// Mode validation (online, offline, hybrid)
const isValidMode = (mode) => {
  const validModes = ['online', 'offline', 'hybrid'];
  return validModes.includes((mode || '').toLowerCase());
};

// Participation type validation
const isValidParticipationType = (type) => {
  const validTypes = ['SOLO', 'TEAM', 'solo', 'team'];
  return validTypes.includes(type);
};

// Team name validation
const isValidTeamName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[a-zA-Z0-9\s\-_&.,'()]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Registration fee validation (non-negative number)
const isValidFee = (fee) => {
  return typeof fee === 'number' && fee >= 0;
};

// Participant count validation
const isValidParticipantCount = (min, max) => {
  return (
    typeof min === 'number' && min > 0 &&
    typeof max === 'number' && max >= min
  );
};

// URL validation
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Location validation
const isValidLocation = (location) => {
  if (!location || typeof location !== 'object') return false;
  const { venueName, address, city, latitude, longitude } = location;
  
  return (
    venueName && typeof venueName === 'string' && venueName.trim().length > 0 &&
    address && typeof address === 'string' && address.trim().length > 0 &&
    city && typeof city === 'string' && city.trim().length > 0 &&
    typeof latitude === 'number' && latitude >= -90 && latitude <= 90 &&
    typeof longitude === 'number' && longitude >= -180 && longitude <= 180
  );
};

// MongoDB ObjectId validation
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Date validation
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Field length validation
const isValidLength = (value, min, max) => {
  if (typeof value !== 'string') return false;
  const length = value.trim().length;
  return length >= min && length <= max;
};

// Compound validations for key operations

// Student registration validation
exports.validateStudentRegistration = (data) => {
  const errors = [];

  if (!data.firstName || !isValidName(data.firstName)) {
    errors.push('Invalid first name. Use letters, spaces, hyphens, and apostrophes only.');
  }

  if (!data.lastName || !isValidName(data.lastName)) {
    errors.push('Invalid last name. Use letters, spaces, hyphens, and apostrophes only.');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email format.');
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Invalid phone number.');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters with letters and numbers.');
  }

  if (!data.college || !isValidCollege(data.college)) {
    errors.push('Invalid college name.');
  }

  if (data.regNumber && !isValidRollNumber(data.regNumber)) {
    errors.push('Invalid roll number.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hackathon creation validation
exports.validateHackathonCreation = (data) => {
  const errors = [];

  if (!data.title || !isValidHackathonTitle(data.title)) {
    errors.push('Invalid hackathon title.');
  }

  if (!data.mode || !isValidMode(data.mode)) {
    errors.push('Mode must be online, offline, or hybrid.');
  }

  if (!isValidFee(data.registrationFee)) {
    errors.push('Registration fee must be a non-negative number.');
  }

  if (!data.participationType || !isValidParticipationType(data.participationType)) {
    errors.push('Participation type must be SOLO or TEAM.');
  }

  if (data.participationType === 'TEAM' || data.participationType === 'team') {
    if (!data.minTeamSize || !data.maxTeamSize || !isValidParticipantCount(data.minTeamSize, data.maxTeamSize)) {
      errors.push('Invalid team size range.');
    }
  }

  if (!data.startDate || !isValidDate(new Date(data.startDate))) {
    errors.push('Invalid start date.');
  }

  if (!data.endDate || !isValidDate(new Date(data.endDate))) {
    errors.push('Invalid end date.');
  }

  if (new Date(data.startDate) >= new Date(data.endDate)) {
    errors.push('End date must be after start date.');
  }

  if (data.mode === 'offline' || data.mode === 'offline') {
    if (!isValidLocation(data.location)) {
      errors.push('For offline hackathons, valid location (venue, address, city, coordinates) is required.');
    }
  }

  if (!data.maxParticipants || !Number.isInteger(data.maxParticipants) || data.maxParticipants <= 0) {
    errors.push('Max participants must be a positive integer.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hackathon registration validation
exports.validateHackathonRegistration = (data) => {
  const errors = [];

  if (!data.hackathonId || !isValidObjectId(data.hackathonId)) {
    errors.push('Invalid hackathon ID.');
  }

  if (!data.participationType || !isValidParticipationType(data.participationType)) {
    errors.push('Participation type must be SOLO or TEAM.');
  }

  if (data.participationType === 'TEAM' || data.participationType === 'team') {
    if (!data.teamData) {
      errors.push('Team data is required for team-based registration.');
    } else {
      if (!data.teamData.teamName || !isValidTeamName(data.teamData.teamName)) {
        errors.push('Invalid team name.');
      }

      if (!Array.isArray(data.teamData.members) || data.teamData.members.length === 0) {
        errors.push('Team must have at least one member.');
      } else {
        data.teamData.members.forEach((member, index) => {
          if (!member.email || !isValidEmail(member.email)) {
            errors.push(`Invalid email for team member ${index + 1}.`);
          }
          if (!member.rollNumber || !isValidRollNumber(member.rollNumber)) {
            errors.push(`Invalid roll number for team member ${index + 1}.`);
          }
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// QR verification validation
exports.validateQRVerification = (data) => {
  const errors = [];

  if (!data.registrationId || !isValidObjectId(data.registrationId)) {
    errors.push('Invalid registration ID.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Selfie validation
exports.validateSelfie = (file) => {
  const errors = [];

  if (!file) {
    errors.push('Selfie image is required.');
  } else {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.mimetype)) {
      errors.push('Selfie must be in JPEG, PNG, or WebP format.');
    }

    const maxSizeInMB = 5;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      errors.push(`Selfie size must not exceed ${maxSizeInMB}MB.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// College ID card validation
exports.validateCollegeIdCard = (file) => {
  const errors = [];

  if (!file) {
    errors.push('College ID card is required.');
  } else {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/pdf'];
    if (!validMimeTypes.includes(file.mimetype)) {
      errors.push('College ID card must be in JPEG, PNG, or PDF format.');
    }

    const maxSizeInMB = 5;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      errors.push(`College ID card size must not exceed ${maxSizeInMB}MB.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Organizer registration validation
exports.validateOrganizerRegistration = (data) => {
  const errors = [];

  if (!data.firstName || !isValidName(data.firstName)) {
    errors.push('Invalid first name.');
  }

  if (!data.lastName || !isValidName(data.lastName)) {
    errors.push('Invalid last name.');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Invalid email format.');
  }

  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Invalid phone number.');
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters with letters and numbers.');
  }

  if (!data.college || !isValidCollege(data.college)) {
    errors.push('Invalid college name.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export individual validators for granular usage
module.exports = {
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidRollNumber,
  isValidCollege,
  isValidPassword,
  isValidHackathonTitle,
  isValidMode,
  isValidParticipationType,
  isValidTeamName,
  isValidFee,
  isValidParticipantCount,
  isValidUrl,
  isValidLocation,
  isValidObjectId,
  isValidDate,
  isValidLength,
  validateStudentRegistration: exports.validateStudentRegistration,
  validateHackathonCreation: exports.validateHackathonCreation,
  validateHackathonRegistration: exports.validateHackathonRegistration,
  validateQRVerification: exports.validateQRVerification,
  validateSelfie: exports.validateSelfie,
  validateCollegeIdCard: exports.validateCollegeIdCard,
  validateOrganizerRegistration: exports.validateOrganizerRegistration
};
