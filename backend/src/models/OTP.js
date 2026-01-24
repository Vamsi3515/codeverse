const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Automatically delete expired OTPs
  }
}, {
  timestamps: true
});

// Index for faster lookups
otpSchema.index({ email: 1, otp: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
