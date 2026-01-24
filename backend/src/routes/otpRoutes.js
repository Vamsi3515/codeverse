const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// OTP Routes for Student Registration
router.post('/send-email-otp', otpController.sendEmailOTP);
router.post('/verify-email-otp', otpController.verifyEmailOTP);
router.post('/send-mobile-otp', otpController.sendMobileOTP);
router.post('/verify-mobile-otp', otpController.verifyMobileOTP);
router.post('/register-student', otpController.registerStudent);

module.exports = router;
