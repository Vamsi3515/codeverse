const express = require('express');
const hackathonController = require('../controllers/hackathonController');
const submissionController = require('../controllers/submissionController');
const { protect, authorize, checkHackathonCreatorRole } = require('../middleware/auth');
const validators = require('../middleware/validators');

const router = express.Router();

// ============ 1. MOST SPECIFIC NAMED ROUTES (must come FIRST!) ============
// Public routes with specific names
router.get('/available', hackathonController.getAvailableHackathons);
router.get('/nearby', hackathonController.getNearbyHackathons);
router.get('/search', hackathonController.searchHackathons);

// Organizer/Student Coordinator dashboard - NAMED route must come before :id routes
router.get('/organizer/my-hackathons', protect, checkHackathonCreatorRole, hackathonController.getHackathonsByOrganizer);

// Organizer-specific delete endpoint - NAMED route must come before :id routes
router.delete('/organizer/:hackathonId', protect, authorize('organizer', 'admin', 'ORGANIZER', 'STUDENT_COORDINATOR'), hackathonController.deleteHackathon);

// ============ 2. DRAFT ROUTES (specific sub-path) ============
router.post('/draft', protect, checkHackathonCreatorRole, hackathonController.createDraftHackathon);

// ============ 3. SUBMISSION/INTERACTION ENDPOINTS (specific sub-paths - before generic :id) ============
// Student completion trigger
router.post('/:id/complete', protect, hackathonController.completeHackathon);

// Problem submission - submit individual problem solution
router.post('/:hackathonId/submit-problem', protect, submissionController.submitProblem);

// Hackathon submission - final submission with all data
router.post('/:hackathonId/submit', protect, submissionController.submitHackathon);

// Get leaderboard for a hackathon
router.get('/:hackathonId/leaderboard', submissionController.getLeaderboard);

// Get all submissions for a hackathon (organizer only)
router.get('/submissions/hackathon/:hackathonId', protect, submissionController.getHackathonSubmissions);

// Get user's submission for a hackathon
router.get('/:hackathonId/submission', protect, submissionController.getUserSubmission);

// Get user's rank on leaderboard
router.get('/:hackathonId/my-rank', protect, submissionController.getUserRank);

// Get all of user's submissions (for tracking attempted hackathons)
router.get('/my-submissions', protect, submissionController.getMySubmissions);

// Get hackathon location
router.get('/:id/location', hackathonController.getHackathonLocation);

// ============ 4. PROBLEM MANAGEMENT ROUTES (specific sub-paths) ============
// Problem statement management - organizer only
router.post('/:id/problems', protect, checkHackathonCreatorRole, hackathonController.addProblemStatement);
router.put('/:id/problems/:problemId', protect, checkHackathonCreatorRole, hackathonController.updateProblemStatement);
router.delete('/:id/problems/:problemId', protect, checkHackathonCreatorRole, hackathonController.deleteProblemStatement);

// ============ 5. GENERIC HACKATHON ROUTES (comes LAST - most generic!) ============
// Public - get all hackathons
router.get('/', hackathonController.getAllHackathons);

// Protected routes
router.post('/', protect, checkHackathonCreatorRole, validators.validateHackathonCreate, hackathonController.createHackathon);
router.put('/:id', protect, checkHackathonCreatorRole, validators.validateHackathonCreate, hackathonController.updateHackathon);
router.put('/:id/publish', protect, checkHackathonCreatorRole, hackathonController.publishHackathon);
router.delete('/:id', protect, authorize('organizer', 'admin', 'ORGANIZER', 'STUDENT_COORDINATOR'), hackathonController.deleteHackathon);

// Generic get hackathon (comes LAST - most generic!)
router.get('/:id', hackathonController.getHackathon);

module.exports = router;
