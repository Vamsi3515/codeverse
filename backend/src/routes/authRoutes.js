const express = require('express');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { asyncHandler } = require('../middleware/errorHandler');
const validators = require('../middleware/validators');

const router = express.Router();

// ============ STUDENT ENDPOINTS ============
router.post('/student/signup', validators.validateStudentReg, asyncHandler(authController.studentSignup));
router.post('/student/login', asyncHandler(authController.studentLogin));
router.post('/student/verify-email', asyncHandler(authController.verifyEmailOTP));
router.post('/student/resend-otp', asyncHandler(authController.resendOTP));

// ============ ORGANIZER ENDPOINTS ============
router.post('/organizer/signup', validators.validateOrganizerReg, asyncHandler(authController.organizerSignup));
router.post('/organizer/login', asyncHandler(authController.organizerLogin));
router.post('/organizer/verify-email', asyncHandler(authController.verifyOrganizerEmailOTP));
router.post('/organizer/resend-otp', asyncHandler(authController.resendOrganizerOTP));
router.post('/organizer/send-otp', asyncHandler(authController.sendOrganizerOTP));
router.post('/organizer/verify-otp', asyncHandler(authController.verifyOrganizerOTP));

// ============ COMMON ENDPOINTS ============
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.put('/reset-password/:token', asyncHandler(authController.resetPassword));

// Upload routes
router.post('/upload-college-id', upload.single('collegeIdCard'), asyncHandler(authController.uploadCollegeIdCard));
router.post('/upload-selfie', upload.single('liveSelfie'), asyncHandler(authController.uploadLiveSelfie));
router.post('/upload-proof', upload.single('proofDocument'), asyncHandler(authController.uploadProofDocument));
router.post('/upload-hackathon-image', upload.single('hackathonImage'), asyncHandler(authController.uploadHackathonImage));

// Protected routes
router.get('/me', protect, asyncHandler(authController.getCurrentUser));
router.put('/update-profile', protect, asyncHandler(authController.updateProfile));

module.exports = router;
