const express = require('express');
const resultController = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Judge scoring
router.post('/:resultId/add-score', protect, authorize('organizer', 'admin'), resultController.addJudgeScore);

// Results declaration and certificates
router.post('/hackathon/:hackathonId/declare', protect, authorize('organizer', 'admin'), resultController.declareResults);
router.post('/hackathon/:hackathonId/generate-certificates', protect, authorize('organizer', 'admin'), resultController.generateCertificates);

// Leaderboards
router.get('/hackathon/:hackathonId/leaderboard', resultController.getLeaderboard);
router.get('/global-leaderboard', resultController.getGlobalLeaderboard);
router.get('/hackathon/:hackathonId/results', resultController.getHackathonResults);

// User certificates
router.get('/my/certificates', protect, resultController.getUserCertificates);

module.exports = router;
