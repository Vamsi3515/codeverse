const crypto = require('crypto');
const OTPVerification = require('../models/OTPVerification');

// Generate 6-digit OTP
exports.generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Create OTP record in database
exports.createOTP = async (identifier, type) => {
  const otp = exports.generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing OTP for this identifier
  await OTPVerification.deleteMany({ identifier, type });

  // Create new OTP
  await OTPVerification.create({
    identifier,
    otp,
    type,
    expiresAt,
  });

  return otp;
};

// Verify OTP
exports.verifyOTP = async (identifier, otp, type) => {
  const otpRecord = await OTPVerification.findOne({ 
    identifier, 
    type,
    verified: false,
  });

  if (!otpRecord) {
    return { success: false, message: 'OTP not found or already verified' };
  }

  // Check expiry
  if (new Date() > otpRecord.expiresAt) {
    await OTPVerification.deleteOne({ _id: otpRecord._id });
    return { success: false, message: 'OTP expired. Please request a new one.' };
  }

  // Check attempts
  if (otpRecord.attempts >= 3) {
    await OTPVerification.deleteOne({ _id: otpRecord._id });
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    return { success: false, message: 'Invalid OTP' };
  }

  // Mark as verified
  otpRecord.verified = true;
  await otpRecord.save();

  return { success: true, message: 'OTP verified successfully' };
};

// Check if identifier is verified
exports.isVerified = async (identifier, type) => {
  const otpRecord = await OTPVerification.findOne({ 
    identifier, 
    type,
    verified: true,
  });

  return !!otpRecord;
};

// Clear verified OTPs (after registration)
exports.clearVerifiedOTPs = async (email, phone) => {
  await OTPVerification.deleteMany({
    $or: [
      { identifier: email, type: 'email', verified: true },
      { identifier: phone, type: 'mobile', verified: true },
    ],
  });
};
