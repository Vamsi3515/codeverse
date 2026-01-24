const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true, // email or phone
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'mobile'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index - automatically delete when expired
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient lookups
otpVerificationSchema.index({ identifier: 1, type: 1 });

module.exports = mongoose.model('OTPVerification', otpVerificationSchema);
