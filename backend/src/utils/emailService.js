const nodemailer = require('nodemailer');

// Create transporter only if email credentials are provided
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
    },
  });
}

exports.sendEmail = async (options) => {
  // Email service is REQUIRED - throw error if not configured
  if (!transporter) {
    console.error('❌ EMAIL SERVICE NOT CONFIGURED');
    console.error('Please configure EMAIL_USER and EMAIL_PASS in .env file');
    throw new Error('Email service is not configured. Please contact administrator.');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', options.email);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Failed to send email. Please try again later.');
  }
};

exports.generateVerificationEmail = (verificationLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { color: #333; text-align: center; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Welcome to CodeVerse Campus!</h1>
        <p>Thank you for registering. Please verify your email to get started.</p>
        <p style="text-align: center;">
          <a href="${verificationLink}" class="button">Verify Email</a>
        </p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;
};

exports.generatePasswordResetEmail = (resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { color: #333; text-align: center; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Password Reset Request</h1>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <p style="text-align: center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </p>
        <p>This link expires in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;
};


// Generate Hackathon Completion Email
exports.generateHackathonCompletionEmail = (studentName, hackathonTitle) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; margin-bottom: 20px; }
        .content { color: #555; line-height: 1.6; font-size: 16px; }
        .success-icon { text-align: center; font-size: 48px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Hackathon Completed!</h1>
        <div class="success-icon">🎉</div>
        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your participation in <strong>${hackathonTitle}</strong> has been successfully completed.</p>
          <p>We hope you had a great experience solving the challenges!</p>
          <p>Results will be announced shortly on the platform.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CodeVerse Campus. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate OTP Verification Email (Matching specification exactly)
exports.generateOTPEmail = (studentName, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { color: #333; text-align: center; margin-bottom: 20px; }
        .logo { text-align: center; margin-bottom: 20px; color: #007bff; font-size: 24px; font-weight: bold; }
        .otp-box { background-color: #f0f7ff; padding: 25px; text-align: center; border-radius: 8px; margin: 25px 0; border: 2px solid #007bff; }
        .otp-code { font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 10px 0; }
        .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .highlight { color: #dc3545; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎓 CodeVerse Campus</div>
        <h1 class="header">Email Verification OTP</h1>
        <p>Hello <strong>${studentName}</strong>,</p>
        <p>Your OTP for email verification is:</p>
        <div class="otp-box">
          <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
          <p class="otp-code">${otp}</p>
          <p style="margin: 0; color: #666; font-size: 12px;">⏱️ This OTP is valid for <span class="highlight">1 minute</span></p>
        </div>
        <div class="warning">
          <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Never share this OTP with anyone</li>
            <li>CodeVerse Campus will never ask for your OTP via call or text</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
        </div>
        <p style="color: #666; font-size: 14px;">Having trouble? Contact our support team or try requesting a new OTP.</p>
        <div class="footer">
          <p><strong>CodeVerse Campus</strong></p>
          <p>Empowering Students Through Hackathons</p>
          <p>© ${new Date().getFullYear()} CodeVerse Campus. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.generateHackathonReminderEmail = (hackathonTitle, eventDate) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
        .header { color: #333; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="header">Hackathon Reminder: ${hackathonTitle}</h1>
        <p>This is a reminder that the hackathon you registered for starts on:</p>
        <h2 style="text-align: center; color: #007bff;">${eventDate}</h2>
        <p>Get ready to showcase your skills and compete with the best developers!</p>
        <p>Good luck! 🚀</p>
      </div>
    </body>
    </html>
  `;
};

// Generate Registration Confirmation Email
exports.generateRegistrationConfirmationEmail = (studentName, hackathonDetails) => {
  const { title, mode, startDate, endDate, location, college } = hackathonDetails;
  
  // Format dates
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const venueSection = mode === 'offline' || mode === 'Offline' ? `
    <div class="venue-section">
      <h3 style="color: #007bff; margin-bottom: 10px;">📍 Venue Details</h3>
      <p style="margin: 5px 0;"><strong>Location:</strong> ${location?.venueName || 'TBA'}</p>
      <p style="margin: 5px 0;"><strong>Address:</strong> ${location?.address || ''} ${location?.city ? ', ' + location.city : ''}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .success-badge { background-color: #28a745; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; margin: 15px 0; font-weight: bold; }
        .event-card { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
        .event-title { color: #333; font-size: 24px; font-weight: bold; margin-bottom: 15px; }
        .detail-row { margin: 12px 0; padding: 10px; background-color: white; border-radius: 5px; }
        .detail-label { color: #666; font-weight: bold; display: inline-block; width: 100px; }
        .detail-value { color: #333; }
        .mode-badge { display: inline-block; padding: 5px 15px; border-radius: 15px; font-weight: bold; font-size: 14px; }
        .mode-online { background-color: #e3f2fd; color: #1976d2; }
        .mode-offline { background-color: #fff3e0; color: #f57c00; }
        .venue-section { background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .info-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .cta-button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 CodeVerse Campus</div>
          <h1 style="margin: 0; font-size: 28px;">Registration Confirmed!</h1>
          <div class="success-badge">✓ Successfully Registered</div>
        </div>

        <p style="font-size: 16px; color: #333;">Hello <strong>${studentName}</strong>,</p>
        
        <p style="color: #555; line-height: 1.6;">
          Congratulations! You have successfully registered for the following hackathon. 
          We're excited to have you participate in this amazing event!
        </p>

        <div class="event-card">
          <div class="event-title">🏆 ${title}</div>
          
          <div class="detail-row">
            <span class="detail-label">Mode:</span>
            <span class="mode-badge ${mode === 'online' || mode === 'Online' ? 'mode-online' : 'mode-offline'}">
              ${mode === 'online' || mode === 'Online' ? '💻 Online' : '🏢 Offline'}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Organizing College:</span>
            <span class="detail-value">${college || 'TBA'}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Start Date:</span>
            <span class="detail-value">${formatDate(startDate)}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">End Date:</span>
            <span class="detail-value">${formatDate(endDate)}</span>
          </div>

          ${venueSection}
        </div>

        <div class="info-box">
          <p style="margin: 0;"><strong>📋 Next Steps:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Check your dashboard for event updates</li>
            <li>Prepare your development environment</li>
            ${mode === 'offline' || mode === 'Offline' ? '<li>Note the venue address and plan your travel</li>' : '<li>Ensure you have a stable internet connection</li>'}
            <li>Review the hackathon rules and guidelines</li>
          </ul>
        </div>

        <p style="color: #555; line-height: 1.6;">
          We wish you the best of luck! Show your skills, collaborate with peers, and most importantly, 
          have fun building something amazing! 🚀
        </p>

        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/student" class="cta-button">
            View My Dashboard
          </a>
        </div>

        <div class="footer">
          <p><strong>CodeVerse Campus</strong></p>
          <p>Empowering Students Through Hackathons</p>
          <p>Need help? Contact us at ${process.env.EMAIL_USER || 'support@codeverse.com'}</p>
          <p>© ${new Date().getFullYear()} CodeVerse Campus. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
