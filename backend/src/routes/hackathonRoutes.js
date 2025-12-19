const express = require('express');
const hackathonController = require('../controllers/hackathonController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', hackathonController.getAllHackathons);
router.get('/nearby', hackathonController.getNearbyHackathons);
router.get('/search', hackathonController.searchHackathons);
router.get('/:id', hackathonController.getHackathon);

// Protected routes - organizer/admin only
router.post('/', protect, authorize('organizer', 'admin'), hackathonController.createHackathon);
router.put('/:id', protect, authorize('organizer', 'admin'), hackathonController.updateHackathon);
router.put('/:id/publish', protect, authorize('organizer', 'admin'), hackathonController.publishHackathon);
router.delete('/:id', protect, authorize('organizer', 'admin'), hackathonController.deleteHackathon);

// Organizer dashboard
router.get('/organizer/my-hackathons', protect, authorize('organizer', 'admin'), hackathonController.getHackathonsByOrganizer);

module.exports = router;
