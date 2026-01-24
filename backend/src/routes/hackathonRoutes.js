const express = require('express');
const hackathonController = require('../controllers/hackathonController');
const { protect, authorize, checkHackathonCreatorRole } = require('../middleware/auth');
const validators = require('../middleware/validators');

const router = express.Router();

// Public routes
router.get('/', hackathonController.getAllHackathons);
router.get('/available', hackathonController.getAvailableHackathons);
router.get('/nearby', hackathonController.getNearbyHackathons);
router.get('/search', hackathonController.searchHackathons);
router.get('/:id', hackathonController.getHackathon);
router.get('/:id/location', hackathonController.getHackathonLocation);

// Protected routes - organizer/student coordinator/admin only
router.post('/', protect, checkHackathonCreatorRole, validators.validateHackathonCreate, hackathonController.createHackathon);
router.post('/draft', protect, checkHackathonCreatorRole, hackathonController.createDraftHackathon);
router.put('/:id', protect, checkHackathonCreatorRole, validators.validateHackathonCreate, hackathonController.updateHackathon);
router.put('/:id/publish', protect, checkHackathonCreatorRole, hackathonController.publishHackathon);
router.delete('/:id', protect, authorize('organizer', 'admin', 'ORGANIZER', 'STUDENT_COORDINATOR'), hackathonController.deleteHackathon);

// Problem statement management - organizer only
router.post('/:id/problems', protect, checkHackathonCreatorRole, hackathonController.addProblemStatement);
router.put('/:id/problems/:problemId', protect, checkHackathonCreatorRole, hackathonController.updateProblemStatement);
router.delete('/:id/problems/:problemId', protect, checkHackathonCreatorRole, hackathonController.deleteProblemStatement);

// Organizer/Student Coordinator dashboard
router.get('/organizer/my-hackathons', protect, checkHackathonCreatorRole, hackathonController.getHackathonsByOrganizer);

// Organizer-specific delete endpoint (more semantic)
router.delete('/organizer/:hackathonId', protect, authorize('organizer', 'admin', 'ORGANIZER', 'STUDENT_COORDINATOR'), hackathonController.deleteHackathon);

module.exports = router;
