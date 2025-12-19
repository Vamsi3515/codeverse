const express = require('express');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getCurrentUser);
router.put('/update-profile', protect, authController.updateProfile);

module.exports = router;
