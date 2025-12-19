const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
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
