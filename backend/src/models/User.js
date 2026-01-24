const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    // Legacy single role field (for backward compatibility)
    role: {
      type: String,
      enum: ['student', 'admin', 'organizer', 'ORGANIZER', 'STUDENT_COORDINATOR'],
      default: 'student',
    },
    // New multiple roles array field
    roles: {
      type: [String],
      enum: ['STUDENT', 'STUDENT_COORDINATOR', 'ORGANIZER', 'ADMIN'],
      default: ['STUDENT'],
    },
    college: {
      type: String,
      required: [true, 'Please provide your college name'],
    },
    branch: {
      type: String,
    },
    semester: {
      type: Number,
    },
    regNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but enforces uniqueness for non-null values
    },
    profilePicture: {
      type: String,
      default: null,
    },
    collegeIdCard: {
      type: String,
      default: null,
    },
    collegeIdCardHash: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined, // Prevents storing null values
    },
    liveSelfie: {
      type: String,
      default: null,
    },
    selfieHash: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined, // Prevents storing null values
    },
    bio: {
      type: String,
      default: '',
    },
    skills: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    cameraVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetToken: String,
    resetTokenExpire: Date,
    // Email OTP fields
    emailOTP: {
      type: String,
      select: false, // Don't return in queries by default
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    coins: {
      type: Number,
      default: 0,
    },
    totalHackathonsParticipated: {
      type: Number,
      default: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    // Google Calendar OAuth tokens
    googleAccessToken: {
      type: String,
      select: false,
    },
    googleRefreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
