const express = require('express');
const registrationController = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');
const validators = require('../middleware/validators');

const router = express.Router();

// Public route (no auth required) - for QR code scanning
router.get('/public/:registrationId', registrationController.getPublicRegistrationDetails);

// Public QR verification route - Shows full registration details when QR is scanned
router.get('/verify/:registrationId', registrationController.verifyRegistrationDetails);

// Student routes
router.post('/', protect, validators.validateHackathonReg, registrationController.registerForHackathon);
router.get('/my-registrations', protect, registrationController.getMyRegistrations);
router.delete('/:registrationId', protect, registrationController.withdrawRegistration);

// Organizer routes
router.get('/hackathon/:hackathonId', protect, authorize('organizer', 'admin'), registrationController.getHackathonRegistrations);
router.put('/:registrationId/mark-attended', protect, authorize('organizer', 'admin'), registrationController.markAsAttended);
router.get('/hackathon/:hackathonId/stats', protect, authorize('organizer', 'admin'), registrationController.getRegistrationStats);

// QR verification (Organizer)
router.post('/verify-qr', protect, authorize('organizer', 'admin'), registrationController.verifyOfflineQr);

module.exports = router;
