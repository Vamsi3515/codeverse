const { createOTP, verifyOTP, isVerified, clearVerifiedOTPs } = require('../utils/otpService');
const { sendEmail } = require('../utils/emailService');
const { sendSMS, generateOTPMessage } = require('../utils/smsService');
const User = require('../models/User');
const { validateCollegeEmail } = require('../utils/emailValidation');

// Send Email OTP
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
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

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate and store OTP
    const otp = await createOTP(email, 'email');

    // Send OTP via email
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; }
          .header { color: #333; text-align: center; }
          .otp-box { background-color: #f0f7ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; }
          .warning { color: #dc2626; font-size: 14px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="header">Email Verification</h1>
          <p>Thank you for registering with CodeVerse Campus!</p>
          <p>Please use the following OTP to verify your email address:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <p style="margin-top: 10px; color: #666;">This code will expire in 5 minutes</p>
          </div>
          <p class="warning">⚠️ Do not share this OTP with anyone. CodeVerse Campus will never ask for your OTP.</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email,
      subject: 'Email Verification OTP - CodeVerse Campus',
      message: emailHTML,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email successfully',
    });
  } catch (error) {
    console.error('Send Email OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify Email OTP
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const result = await verifyOTP(email, otp, 'email');

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Verify Email OTP Error:', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// Send Mobile OTP
exports.sendMobileOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    // Check if phone already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    // Generate and store OTP
    const otp = await createOTP(phone, 'mobile');

    // Send OTP via SMS
    const message = generateOTPMessage(otp);
    await sendSMS(phone, message);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your mobile number successfully',
    });
  } catch (error) {
    console.error('Send Mobile OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify Mobile OTP
exports.verifyMobileOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const result = await verifyOTP(phone, otp, 'mobile');

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Verify Mobile OTP Error:', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// Secure Student Registration (ONLY after all verifications)
exports.registerStudent = async (req, res) => {
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
      cameraVerified,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !college) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // SECURITY CHECK: Verify that email OTP was verified
    const emailVerified = await isVerified(email, 'email');
    if (!emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required. Please verify your email first.',
      });
    }

    // SECURITY CHECK: Verify that mobile OTP was verified
    const mobileVerified = await isVerified(phone, 'mobile');
    if (!mobileVerified) {
      return res.status(403).json({
        success: false,
        message: 'Mobile verification required. Please verify your phone number first.',
      });
    }

    // SECURITY CHECK: Camera verification is mandatory
    if (!cameraVerified) {
      return res.status(403).json({
        success: false,
        message: 'Camera verification is mandatory. Please capture your selfie.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already registered' });
    }

    // Create verified user
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
      role: 'student',
      emailVerified: true,
      mobileVerified: true,
      cameraVerified: true,
      isVerified: true, // Fully verified
    });

    await user.save();

    // Clear verified OTPs from database
    await clearVerifiedOTPs(email, phone);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Register Student Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
