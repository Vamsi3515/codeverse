const express = require('express');
const registrationController = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Student routes
router.post('/', protect, registrationController.registerForHackathon);
router.get('/my-registrations', protect, registrationController.getMyRegistrations);
router.delete('/:registrationId', protect, registrationController.withdrawRegistration);

// Organizer routes
router.get('/hackathon/:hackathonId', protect, authorize('organizer', 'admin'), registrationController.getHackathonRegistrations);
router.put('/:registrationId/mark-attended', protect, authorize('organizer', 'admin'), registrationController.markAsAttended);
router.get('/hackathon/:hackathonId/stats', protect, authorize('organizer', 'admin'), registrationController.getRegistrationStats);

module.exports = router;
