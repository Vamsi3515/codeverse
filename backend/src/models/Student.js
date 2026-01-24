const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
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
      lowercase: true,
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
    college: {
      type: String,
      required: [true, 'Please provide your college name'],
    },
    collegeAddress: {
      type: String,
      trim: true,
    },
    collegeLat: {
      type: Number,
    },
    collegeLng: {
      type: Number,
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
      sparse: true,
      default: undefined,
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
      sparse: true,
      default: undefined,
    },
    liveSelfie: {
      type: String,
      default: null,
    },
    selfieHash: {
      type: String,
      unique: true,
      sparse: true,
      default: undefined,
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
    emailOTP: {
      type: String,
      select: false,
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
  },
  { timestamps: true }
);

// Pre-save validation: convert empty strings to undefined for sparse unique fields
studentSchema.pre('save', function (next) {
  if (this.regNumber === '' || this.regNumber === null) {
    this.regNumber = undefined;
  }
  if (this.collegeIdCardHash === '' || this.collegeIdCardHash === null) {
    this.collegeIdCardHash = undefined;
  }
  if (this.selfieHash === '' || this.selfieHash === null) {
    this.selfieHash = undefined;
  }
  next();
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match passwords
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
