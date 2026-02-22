const crypto = require('crypto');
const fs = require('fs');
const User = require('../models/User');
const Student = require('../models/Student');
const Organizer = require('../models/Organizer');
const OTPVerification = require('../models/OTPVerification');
const OTP = require('../models/OTP');
const { sendEmail, generateVerificationEmail, generatePasswordResetEmail, generateOTPEmail, generateOTP } = require('../utils/emailService');
const { generateToken, getResetToken, getVerificationToken } = require('../utils/tokenService');
const { validateCollegeEmail } = require('../utils/emailValidation');
const { generateImageHash, checkMultipleDuplicates } = require('../utils/imageHashService');
const { geocodeAddress } = require('../utils/geocodingService');

// Single exception allowed to bypass role separation for login
const ROLE_EXCEPTION_EMAIL = '22b61a0557@sitam.co.in';

// Blocked personal email domains for organizer registration
const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'mail.com',
  'mailinator.com',
  'temp-mail.org',
  'guerrillamail.com',
  'yandex.com',
  'protonmail.com',
  'tutanota.com',
  'aol.com',
  'icloud.com',
  'qq.com',
  '163.com',
  '126.com',
];

// Helper function to validate organizer email domain
const isValidOrganizerEmail = (email) => {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  // Block personal email domains
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return false;
  }
  
  // Allow organizational/educational domains (.edu, .org, .co.in, company.com, etc.)
  // Must have a proper domain structure
  return domain.includes('.');
};

// ============ STUDENT ENDPOINTS ============

exports.studentSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, college, collegeAddress, branch, semester, regNumber, collegeIdCard, liveSelfie, collegeIdCardHash, selfieHash } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !college) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const normalizedEmail = email.toLowerCase();

    // Validate college email
    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: emailValidation.message,
        isPublicEmail: true 
      });
    }

    // STRICT SEPARATION: Check if email already exists in Student collection (case-insensitive)
    const existingStudent = await Student.findOne({ email: normalizedEmail });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'This email is already registered as a student.' });
    }

    // BLOCK CROSS-REGISTRATION: Check if email exists in Organizer collection (case-insensitive)
    const existingOrganizer = await Organizer.findOne({ email: normalizedEmail });
    if (existingOrganizer) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered as an organizer.' 
      });
    }

    // Check for duplicate student credentials BEFORE sending OTP
    const duplicateChecks = {};
    if (regNumber) duplicateChecks.regNumber = regNumber;
    if (collegeIdCardHash) duplicateChecks.collegeIdCardHash = collegeIdCardHash;
    if (selfieHash) duplicateChecks.selfieHash = selfieHash;

    if (Object.keys(duplicateChecks).length > 0) {
      const duplicateResult = await checkMultipleDuplicates(Student, duplicateChecks);
      if (duplicateResult.isDuplicate) {
        return res.status(409).json({ 
          success: false, 
          message: duplicateResult.message,
          isDuplicate: true,
          duplicateField: duplicateResult.field
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    // Store OTP in temporary verification record (not in Student record yet)
    await OTPVerification.deleteMany({ identifier: `student:${normalizedEmail}`, type: 'email' });
    
    const otpRecord = new OTPVerification({
      identifier: `student:${normalizedEmail}`,
      otp,
      type: 'email',
      expiresAt: otpExpiry,
      verified: false,
      attempts: 0,
      data: {
        firstName,
        lastName,
        password,
        phone,
        college,
        collegeAddress: collegeAddress || null,
        branch,
        semester,
        regNumber,
        collegeIdCard: collegeIdCard || null,
        collegeIdCardHash: collegeIdCardHash || null,
        liveSelfie: liveSelfie || null,
        selfieHash: selfieHash || null,
      }
    });

    await otpRecord.save();
    console.log('✅ [SIGNUP] OTP created for:', normalizedEmail);

    // Send OTP email
    const studentName = `${firstName} ${lastName}`;
    try {
      await sendEmail({
        email: normalizedEmail,
        subject: 'CodeVerse Campus - Email Verification OTP',
        message: generateOTPEmail(studentName, otp),
      });
      console.log('✅ [SIGNUP] OTP email sent to:', normalizedEmail);
    } catch (emailError) {
      console.error('❌ [SIGNUP] Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify your email to complete registration.',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase();
    const isExceptionEmail = normalizedEmail === ROLE_EXCEPTION_EMAIL;

    // Prefer student account; allow the single exception to reuse organizer credentials
    let account = await Student.findOne({ email: normalizedEmail }).select('+password');
    let accountType = 'student';

    if (!account) {
      const organizerAccount = await Organizer.findOne({ email: normalizedEmail }).select('+password');
      if (organizerAccount) {
        if (!isExceptionEmail) {
          return res.status(403).json({ success: false, message: 'This account is registered as an Organizer. Please use Organizer Login.' });
        }
        account = organizerAccount;
        accountType = 'organizer';
      }
    }

    if (!account) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await account.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (accountType === 'student') {
      if (!account.isEmailVerified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please verify your email before login',
          requiresEmailVerification: true 
        });
      }

      if (!account.collegeIdCard) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please upload your College ID Card to complete verification',
          requiresIdCard: true 
        });
      }

      if (!account.liveSelfie) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please upload a live selfie to complete verification',
          requiresSelfie: true 
        });
      }
    } else {
      if (!account.isEmailVerified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please verify your email before login',
          requiresEmailVerification: true 
        });
      }

      if (!account.proofDocument) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please upload proof of authorization to complete verification',
          requiresProof: true 
        });
      }
    }

    account.lastLogin = Date.now();
    await account.save();

    const token = generateToken(account._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        college: account.college,
        role: accountType === 'organizer' ? account.role || 'organizer' : 'student',
        isVerified: account.isVerified,
        isEmailVerified: account.isEmailVerified,
        roleSource: accountType,
        isRoleException: isExceptionEmail,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email OTP - Student
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and OTP' 
      });
    }

    const normalizedEmail = email.toLowerCase();
    console.log('🔍 [VERIFY EMAIL OTP] Verifying OTP for:', normalizedEmail);

    // Find OTP verification record
    const otpRecord = await OTPVerification.findOne({
      identifier: `student:${normalizedEmail}`,
      type: 'email',
    });

    if (!otpRecord) {
      console.log('❌ [VERIFY EMAIL OTP] OTP record not found for:', normalizedEmail);
      return res.status(404).json({ 
        success: false, 
        message: 'OTP not found. Please request a new OTP.' 
      });
    }

    console.log('📝 [VERIFY EMAIL OTP] Stored OTP:', otpRecord.otp, 'Provided OTP:', otp);
    console.log('⏰ [VERIFY EMAIL OTP] OTP Expiry:', otpRecord.expiresAt, 'Current Time:', new Date());

    if (otpRecord.expiresAt < Date.now()) {
      console.log('❌ [VERIFY EMAIL OTP] OTP expired');
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      if (otpRecord.attempts >= 5) {
        await OTPVerification.deleteOne({ _id: otpRecord._id });
        console.log('❌ [VERIFY EMAIL OTP] Too many failed attempts');
        return res.status(400).json({ 
          success: false, 
          message: 'Too many incorrect attempts. Please request a new OTP.' 
        });
      }
      await otpRecord.save();
      console.log('❌ [VERIFY EMAIL OTP] OTP mismatch. Attempts:', otpRecord.attempts);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please check and try again.' 
      });
    }

    // OTP is valid! Now create the student account
    console.log('✅ [VERIFY EMAIL OTP] OTP verified! Creating student account...');

    // Check if data exists in OTP record
    if (!otpRecord.data) {
      console.error('❌ [VERIFY EMAIL OTP] OTP data missing - likely an old OTP record');
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false, 
        message: 'OTP data expired. Please request a new OTP to register.' 
      });
    }

    const { firstName, lastName, password, phone, college, collegeAddress, branch, semester, regNumber, collegeIdCard, collegeIdCardHash, liveSelfie, selfieHash } = otpRecord.data;

    // Create student with verified email
    const student = new Student({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      phone,
      college,
      collegeAddress: collegeAddress || null,
      branch,
      semester,
      regNumber,
      collegeIdCard: collegeIdCard || null,
      collegeIdCardHash: collegeIdCardHash || null,
      liveSelfie: liveSelfie || null,
      selfieHash: selfieHash || null,
      isEmailVerified: true,
      emailVerified: true,
    });

    // Geocode college address if provided
    if (collegeAddress) {
      try {
        const geoResult = await geocodeAddress(collegeAddress);
        student.collegeLat = geoResult.latitude;
        student.collegeLng = geoResult.longitude;
        console.log(`✅ Geocoded college address: ${collegeAddress} -> (${geoResult.latitude}, ${geoResult.longitude})`);
      } catch (geoError) {
        console.warn('⚠️ Failed to geocode college address:', geoError.message);
      }
    }

    await student.save();
    console.log('✅ [VERIFY EMAIL OTP] Student registered successfully:', normalizedEmail);

    // Delete OTP record
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    const token = generateToken(student._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Your account has been created.',
      token,
      user: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error('❌ [VERIFY EMAIL OTP] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP - Student
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email' 
      });
    }

    const student = await Student.findOne({ email: email.toLowerCase() });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (student.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    
    student.emailOTP = otp;
    student.otpExpiry = otpExpiry;

    await student.save();

    const studentName = `${student.firstName} ${student.lastName}`;
    try {
      await sendEmail({
        email: student.email,
        subject: 'CodeVerse Campus - New OTP',
        message: generateOTPEmail(studentName, otp),
      });
      console.log('✅ OTP email resent to:', student.email);
    } catch (emailError) {
      console.error('❌ Email sending failed');
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ORGANIZER ENDPOINTS ============

// Send OTP specifically for organizer email verification
exports.sendOrganizerOTP = async (req, res) => {
  try {
    const { email, firstName = 'Organizer', lastName = 'Admin' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const normalizedEmail = email.toLowerCase();
    
    // Validate that email is organizational/educational, not personal
    if (!isValidOrganizerEmail(normalizedEmail)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only organizational/educational emails are allowed (e.g., company.com, university.edu, college.co.in). Personal email providers (Gmail, Yahoo, etc.) are not permitted.' 
      });
    }

    // Always fresh OTP - delete previous attempts
    await OTPVerification.deleteMany({ identifier: `organizer:${normalizedEmail}`, type: 'email' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const otpRecord = new OTPVerification({
      identifier: `organizer:${normalizedEmail}`,
      otp,
      type: 'email',
      expiresAt,
      verified: false,
      attempts: 0,
    });

    await otpRecord.save();

    const name = `${firstName} ${lastName}`.trim();
    await sendEmail({
      email: normalizedEmail,
      subject: 'CodeVerse Campus - Organizer Email OTP',
      message: generateOTPEmail(name, otp),
    });

    return res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Organizer OTP send error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify organizer email OTP
exports.verifyOrganizerOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const normalizedEmail = email.toLowerCase();
    
    // Validate that email is organizational/educational
    if (!isValidOrganizerEmail(normalizedEmail)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only organizational/educational emails are allowed. Personal email providers are not permitted.' 
      });
    }

    const otpRecord = await OTPVerification.findOne({
      identifier: `organizer:${normalizedEmail}`,
      type: 'email',
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP not found or already verified. Please request a new OTP.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (otpRecord.attempts >= 5) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Organizer OTP verify error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP. Please try again.' });
  }
};

exports.organizerSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, college, role, proofDocument, proofDocumentHash } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !college || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const normalizedEmail = email.toLowerCase();

    // Validate that email is organizational/educational
    if (!isValidOrganizerEmail(normalizedEmail)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only organizational/educational emails are allowed (e.g., company.com, university.edu, college.co.in). Personal email providers (Gmail, Yahoo, etc.) are not permitted.',
        isPublicEmail: true 
      });
    }

    // Validate email format (still enforce institutional rules)
    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: emailValidation.message,
        isPublicEmail: true 
      });
    }

    // Require OTP to be verified before allowing registration
    const verifiedOTP = await OTPVerification.findOne({
      identifier: `organizer:${normalizedEmail}`,
      type: 'email',
      verified: true,
    });

    if (!verifiedOTP) {
      return res.status(403).json({ success: false, message: 'Email not verified. Please verify with OTP before registering.' });
    }

    if (new Date() > verifiedOTP.expiresAt) {
      await OTPVerification.deleteOne({ _id: verifiedOTP._id });
      return res.status(403).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    // STRICT SEPARATION: Check if email already exists in Organizer collection (case-insensitive)
    const existingOrganizer = await Organizer.findOne({ email: normalizedEmail });
    if (existingOrganizer) {
      return res.status(400).json({ success: false, message: 'This email is already registered as an organizer.' });
    }

    // Create organizer (email already verified via OTP)
    const organizer = new Organizer({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      phone,
      college,
      role,
      proofDocument: proofDocument || null,
      proofDocumentHash: proofDocumentHash || null,
      isEmailVerified: true,
      emailVerified: true,
      isVerified: true,
    });

    await organizer.save();
    console.log('✅ Organizer registered:', organizer.email);

    // Delete OTP record after successful registration
    await OTPVerification.deleteOne({ _id: verifiedOTP._id });

    const token = generateToken(organizer._id);

    res.status(201).json({
      success: true,
      token,
      message: 'Registration completed successfully',
      user: {
        id: organizer._id,
        firstName: organizer.firstName,
        lastName: organizer.lastName,
        email: organizer.email,
        role: organizer.role,
        isEmailVerified: organizer.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.organizerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase();
    const isExceptionEmail = normalizedEmail === ROLE_EXCEPTION_EMAIL;
    
    console.log('🔍 Organizer login attempt for:', normalizedEmail);

    // Prefer organizer account; allow the single exception to reuse student credentials
    let account = await Organizer.findOne({ email: normalizedEmail }).select('+password');
    let accountType = 'organizer';

    if (!account) {
      console.log('❌ Organizer not found in organizers collection');
      const studentAccount = await Student.findOne({ email: normalizedEmail }).select('+password');
      if (studentAccount) {
        console.log('✅ Found in student collection');
        if (!isExceptionEmail) {
          return res.status(403).json({ success: false, message: 'This account is registered as a Student. Please use Student Login.' });
        }
        account = studentAccount;
        accountType = 'student';
      }
    } else {
      console.log('✅ Organizer found:', account.email, 'ID:', account._id, 'Role:', account.role);
    }

    if (!account) {
      console.log('❌ No account found for:', normalizedEmail);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await account.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('✅ Password verified successfully');

    if (accountType === 'organizer') {
      if (!account.isEmailVerified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please verify your email before login',
          requiresEmailVerification: true 
        });
      }

      if (!account.proofDocument) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please upload proof of authorization to complete verification',
          requiresProof: true 
        });
      }
    } else if (accountType === 'student') {
      // For student accounts using exception email
      if (!account.isEmailVerified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please verify your email before login',
          requiresEmailVerification: true 
        });
      }

      if (!account.collegeIdCard) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please upload your College ID Card to complete verification',
          requiresIdCard: true 
        });
      }

      if (!account.liveSelfie) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please upload a live selfie to complete verification',
          requiresSelfie: true 
        });
      }
    }

    account.lastLogin = Date.now();
    await account.save();

    const token = generateToken(account._id);
    
    console.log('✅ Login successful for:', account.email, 'Token generated, Account Type:', accountType);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: account._id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        college: account.college,
        role: accountType === 'student' ? 'organizer' : account.role, // Exception email gets organizer role
        isVerified: account.isVerified,
        isEmailVerified: account.isEmailVerified,
        roleSource: accountType,
        isRoleException: isExceptionEmail,
      },
    });
  } catch (error) {
    console.error('❌ Organizer login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email OTP - Organizer
exports.verifyOrganizerEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and OTP' 
      });
    }

    const organizer = await Organizer.findOne({ email: email.toLowerCase() }).select('+emailOTP +otpExpiry');
    
    if (!organizer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organizer not found' 
      });
    }

    if (organizer.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    if (!organizer.emailOTP || !organizer.otpExpiry) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP found. Please request a new OTP.' 
      });
    }

    if (organizer.otpExpiry < Date.now()) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    if (organizer.emailOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please check and try again.' 
      });
    }

    organizer.isEmailVerified = true;
    organizer.emailVerified = true;
    organizer.emailOTP = undefined;
    organizer.otpExpiry = undefined;

    await organizer.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now complete your registration.',
      user: {
        id: organizer._id,
        email: organizer.email,
        isEmailVerified: organizer.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP - Organizer
exports.resendOrganizerOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email' 
      });
    }

    const organizer = await Organizer.findOne({ email: email.toLowerCase() });
    
    if (!organizer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Organizer not found' 
      });
    }

    if (organizer.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    
    organizer.emailOTP = otp;
    organizer.otpExpiry = otpExpiry;

    await organizer.save();

    const organizerName = `${organizer.firstName} ${organizer.lastName}`;
    try {
      await sendEmail({
        email: organizer.email,
        subject: 'CodeVerse Campus - New OTP',
        message: generateOTPEmail(organizerName, otp),
      });
      console.log('✅ OTP email resent to:', organizer.email);
    } catch (emailError) {
      console.error('❌ Email sending failed');
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ COMMON/LEGACY ENDPOINTS ============


// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email' 
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    user.emailOTP = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // Send OTP email - REQUIRED
    const studentName = `${user.firstName} ${user.lastName}`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'CodeVerse Campus - New OTP',
        message: generateOTPEmail(studentName, otp),
      });
      console.log('✅ OTP email resent successfully to:', user.email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email. Please check your inbox.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      verificationToken: verificationTokenHash,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate reset token
    const { resetToken, resetTokenHash, resetTokenExpire } = getResetToken();
    user.resetToken = resetTokenHash;
    user.resetTokenExpire = resetTokenExpire;

    await user.save();

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset - CodeVerse Campus',
      message: generatePasswordResetEmail(resetLink),
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: resetTokenHash,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    console.log('🔍 [GET CURRENT USER] User ID from token:', req.user.id);
    
    // Try to find user in Student collection first (new structure)
    let user = await Student.findById(req.user.id);
    console.log('📊 [GET CURRENT USER] Student lookup result:', user ? 'Found' : 'Not found');
    
    // If not found in Student, try User collection (fallback)
    if (!user) {
      user = await User.findById(req.user.id);
      console.log('📊 [GET CURRENT USER] User lookup result:', user ? 'Found' : 'Not found');
    }

    if (!user) {
      console.warn('⚠️ [GET CURRENT USER] User not found in either collection');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ [GET CURRENT USER] User found:', user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('❌ [GET CURRENT USER] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, college, branch, semester, bio, skills } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (college) updateData.college = college;
    if (branch) updateData.branch = branch;
    if (semester) updateData.semester = semester;
    if (bio) updateData.bio = bio;
    if (skills) updateData.skills = skills;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload College ID Card
exports.uploadCollegeIdCard = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Generate hash from uploaded file buffer
    const imageHash = generateImageHash(req.file.buffer);
    
    // Check if this College ID Card has already been used
    const duplicateCheck = await checkMultipleDuplicates(User, {
      collegeIdCardHash: imageHash
    });
    
    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({ 
        success: false, 
        message: duplicateCheck.message,
        isDuplicate: true
      });
    }

    // Real file saved to disk
    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log('✅ College ID Card uploaded');
    console.log(`   File: ${req.file.filename}`);
    console.log(`   Path: ${imageUrl}`);
    console.log(`   Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`   Hash: ${imageHash}`);

    res.status(200).json({
      success: true,
      message: 'College ID Card uploaded successfully',
      imageUrl: imageUrl,
      imageHash: imageHash, // Return hash to be stored with user
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload Live Selfie
exports.uploadLiveSelfie = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Generate hash from uploaded file buffer
    const imageHash = generateImageHash(req.file.buffer);
    
    // Check if this selfie has already been used
    const duplicateCheck = await checkMultipleDuplicates(User, {
      selfieHash: imageHash
    });
    
    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({ 
        success: false, 
        message: duplicateCheck.message,
        isDuplicate: true
      });
    }

    // Real file saved to disk
    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log('✅ Live Selfie uploaded');
    console.log(`   File: ${req.file.filename}`);
    console.log(`   Path: ${imageUrl}`);
    console.log(`   Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`   Hash: ${imageHash}`);

    res.status(200).json({
      success: true,
      message: 'Live Selfie uploaded successfully',
      imageUrl: imageUrl,
      imageHash: imageHash, // Return hash to be stored with user
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload proof document for organizer authorization
exports.uploadProofDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    console.log('✅ Proof document uploaded');
    console.log(`   File: ${req.file.filename}`);
    console.log(`   Path: ${fileUrl}`);
    console.log(`   Size: ${(req.file.size / 1024).toFixed(2)} KB`);

    return res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      url: fileUrl,
    });
  } catch (error) {
    console.error('Proof upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
};

// Upload hackathon banner image
exports.uploadHackathonImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Real file saved to disk - return full URL
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    console.log('🖼️ BACKEND: Hackathon image uploaded');
    console.log(`   📁 File: ${req.file.filename}`);
    console.log(`   🔗 Full URL: ${imageUrl}`);
    console.log(`   💾 Size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`   ✅ Response being sent with imageUrl: ${imageUrl}`);

    res.status(200).json({
      success: true,
      message: 'Hackathon image uploaded successfully',
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Hackathon image upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Send OTP without creating user
exports.sendOTP = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    // Validation
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, first name, and last name' 
      });
    }

    // Validate college email (block public domains)
    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: emailValidation.message,
        isPublicEmail: true 
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered. Please login instead.' 
      });
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      expiresAt
    });

    console.log('✅ OTP saved to database:', email);

    // Send OTP email
    const studentName = `${firstName} ${lastName}`;
    try {
      await sendEmail({
        email: email,
        subject: 'CodeVerse Campus - Email Verification OTP',
        message: generateOTPEmail(studentName, otp),
      });
      console.log('✅ OTP email sent successfully to:', email);
    } catch (emailError) {
      // Email failed - delete the OTP and return error
      await OTP.deleteMany({ email });
      console.error('❌ Email sending failed:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please check your email address and try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to continue.',
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
};

// NEW: Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and OTP' 
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP. Please check and try again.' 
      });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // OTP is valid - delete it
    await OTP.deleteMany({ email });

    console.log('✅ OTP verified successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now complete your registration.',
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP. Please try again.' 
    });
  }
};

// NEW: Register user after OTP verification
exports.registerAfterVerification = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      college, 
      branch, 
      semester, 
      regNumber, 
      collegeIdCard, 
      liveSelfie, 
      collegeIdCardHash, 
      selfieHash,
      role 
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !college) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check for duplicate student credentials
    const duplicateChecks = {};
    if (regNumber) duplicateChecks.regNumber = regNumber;
    if (collegeIdCardHash) duplicateChecks.collegeIdCardHash = collegeIdCardHash;
    if (selfieHash) duplicateChecks.selfieHash = selfieHash;

    if (Object.keys(duplicateChecks).length > 0) {
      const duplicateResult = await checkMultipleDuplicates(User, duplicateChecks);
      if (duplicateResult.isDuplicate) {
        return res.status(409).json({ 
          success: false, 
          message: duplicateResult.message,
          isDuplicate: true,
          duplicateField: duplicateResult.field
        });
      }
    }

    // Create user with verified email
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      college,
      branch,
      semester,
      regNumber,
      collegeIdCard: collegeIdCard || null,
      collegeIdCardHash: collegeIdCardHash || null,
      liveSelfie: liveSelfie || null,
      selfieHash: selfieHash || null,
      role: role || 'student',
      isEmailVerified: true, // Email already verified via OTP
    });

    await user.save();
    console.log('✅ User registered successfully:', user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed. Please try again.' 
    });
  }
};


// NEW SEPARATE OTP FLOW - STEP 3: SEND OTP API
exports.sendOTP = async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    // Validation
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, firstName, and lastName' 
      });
    }

    // Validate college email
    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: emailValidation.message,
        isPublicEmail: true 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please login instead.' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTP for this email
    await OTPVerification.deleteMany({ identifier: email, type: 'email' });

    // Save OTP in separate collection (NOT in users collection)
    const otpRecord = new OTPVerification({
      identifier: email,
      otp: otp,
      type: 'email',
      expiresAt: expiresAt,
      verified: false,
      attempts: 0,
    });

    await otpRecord.save();
    console.log('✅ OTP saved to database:', email);

    // Send OTP email
    const studentName = `${firstName} ${lastName}`;
    try {
      await sendEmail({
        email: email,
        subject: 'CodeVerse Campus - Email Verification OTP',
        message: generateOTPEmail(studentName, otp),
      });
      console.log('✅ OTP email sent successfully to:', email);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your email. Please verify within 10 minutes.',
        email: email,
      });
    } catch (emailError) {
      // If email fails, delete OTP record
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      console.error('❌ Email sending failed:', emailError);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check your email address and try again.',
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP. Please try again.' 
    });
  }
};

// STEP 4: VERIFY OTP API
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and OTP' 
      });
    }

    // Find OTP record
    const otpRecord = await OTPVerification.findOne({ 
      identifier: email, 
      type: 'email',
      verified: false 
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP not found or already verified. Please request a new OTP.' 
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Check attempts limit (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ 
        success: false, 
        message: 'Too many incorrect attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({ 
        success: false, 
        message: `Incorrect OTP. ${5 - otpRecord.attempts} attempts remaining.` 
      });
    }

    // OTP is correct - mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    console.log('✅ OTP verified successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now complete your registration.',
      email: email,
      verified: true,
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify OTP. Please try again.' 
    });
  }
};

// STEP 5: CREATE USER AFTER OTP VERIFICATION
exports.completeRegistration = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      college, 
      branch, 
      semester, 
      regNumber, 
      collegeIdCard, 
      liveSelfie, 
      collegeIdCardHash, 
      selfieHash 
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !college) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if OTP was verified
    const verifiedOTP = await OTPVerification.findOne({ 
      identifier: email, 
      type: 'email',
      verified: true 
    });

    if (!verifiedOTP) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email not verified. Please verify your email with OTP first.' 
      });
    }

    // Check if OTP verification is still valid (within 30 minutes of verification)
    const verificationAge = Date.now() - verifiedOTP.createdAt.getTime();
    if (verificationAge > 30 * 60 * 1000) { // 30 minutes
      await OTPVerification.deleteOne({ _id: verifiedOTP._id });
      return res.status(400).json({ 
        success: false, 
        message: 'OTP verification expired. Please verify your email again.' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check for duplicate student credentials
    const duplicateChecks = {};
    if (regNumber) duplicateChecks.regNumber = regNumber;
    if (collegeIdCardHash) duplicateChecks.collegeIdCardHash = collegeIdCardHash;
    if (selfieHash) duplicateChecks.selfieHash = selfieHash;

    if (Object.keys(duplicateChecks).length > 0) {
      const duplicateResult = await checkMultipleDuplicates(User, duplicateChecks);
      if (duplicateResult.isDuplicate) {
        return res.status(409).json({ 
          success: false, 
          message: duplicateResult.message,
          isDuplicate: true,
          duplicateField: duplicateResult.field
        });
      }
    }

    // Create user with email already verified and roles array
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      college,
      branch,
      semester,
      regNumber,
      collegeIdCard: collegeIdCard || null,
      collegeIdCardHash: collegeIdCardHash || undefined, // Use undefined to prevent null storage
      liveSelfie: liveSelfie || null,
      selfieHash: selfieHash || undefined, // Use undefined to prevent null storage
      role: 'student', // Backward compatibility
      roles: ['STUDENT'], // New roles array
      isEmailVerified: true, // Email already verified via OTP
      emailVerified: true,
      isVerified: true,
    });

    await user.save();
    console.log('✅ User created successfully after OTP verification:', user.email);

    // Delete the OTP record after successful registration
    await OTPVerification.deleteOne({ _id: verifiedOTP._id });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        college: user.college,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });

  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed. Please try again.' 
    });
  }
};

// TASK 3: Register existing student as Student Coordinator
exports.registerAsCoordinator = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide your email' 
      });
    }

    // Find existing user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not registered. Please register as a student first.',
        isNewUser: true
      });
    }

    // Check if user is a student (has STUDENT role)
    const isStudent = user.roles && user.roles.includes('STUDENT');
    
    if (!isStudent && user.role !== 'student') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only students can register as Student Coordinators. Please complete student registration first.' 
      });
    }

    // Check if already a coordinator
    const isAlreadyCoordinator = user.roles && user.roles.includes('STUDENT_COORDINATOR');
    
    if (isAlreadyCoordinator) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already registered as a Student Coordinator. Go to login to access organizer portal.',
        alreadyCoordinator: true
      });
    }

    // Check if all verifications are complete
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Email verification incomplete. Please complete student registration first.' 
      });
    }

    if (!user.collegeIdCard) {
      return res.status(403).json({ 
        success: false, 
        message: 'ID Card verification incomplete. Please complete student registration first.' 
      });
    }

    if (!user.liveSelfie) {
      return res.status(403).json({ 
        success: false, 
        message: 'Selfie verification incomplete. Please complete student registration first.' 
      });
    }

    // Append STUDENT_COORDINATOR to existing roles array
    if (!user.roles) {
      user.roles = ['STUDENT']; // Initialize if not present
    }
    
    if (!user.roles.includes('STUDENT_COORDINATOR')) {
      user.roles.push('STUDENT_COORDINATOR');
    }

    // Update role for backward compatibility
    user.role = 'student'; // Keep as student but now with coordinator abilities

    // Mark as verified for coordinator
    user.isVerified = true;

    await user.save();

    console.log('✅ User registered as Student Coordinator:', email);
    console.log(`   Roles: ${user.roles.join(', ')}`);

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Successfully registered as Student Coordinator! Your student verification has been reused.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        roles: user.roles,
        college: user.college,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error('Register as Coordinator error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to register as Student Coordinator. Please try again.' 
    });
  }
};

