const express = require('express');
const registrationController = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');
const validators = require('../middleware/validators');

const router = express.Router();

// Organizer QR verification by registrationId
router.post('/verify', protect, authorize('organizer', 'admin'), validators.validateQRVerify, registrationController.verifyQrByRegistrationId);

module.exports = router;
