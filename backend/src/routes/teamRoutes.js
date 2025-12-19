const express = require('express');
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Team management
router.post('/', protect, teamController.createTeam);
router.get('/:teamId', protect, teamController.getTeam);
router.put('/:teamId', protect, teamController.updateTeam);
router.post('/:teamId/add-member', protect, teamController.addTeamMember);
router.delete('/:teamId/member/:userId', protect, teamController.removeTeamMember);

// Team invitations
router.post('/:teamId/invite', protect, teamController.inviteTeamMember);
router.put('/:teamId/respond-invitation', protect, teamController.respondToInvitation);

// Project submission
router.put('/:teamId/submit', protect, teamController.submitTeamProject);

// View teams
router.get('/hackathon/:hackathonId', protect, teamController.getTeamsByHackathon);
router.get('/my/teams', protect, teamController.getMyTeams);

module.exports = router;
