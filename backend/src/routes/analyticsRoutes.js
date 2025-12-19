const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Hackathon analytics - organizer only
router.get('/hackathon/:hackathonId', protect, authorize('organizer', 'admin'), analyticsController.getHackathonAnalytics);

// Admin dashboard
router.get('/admin/dashboard', protect, authorize('admin'), analyticsController.getAdminDashboard);

// User analytics
router.get('/user/my-analytics', protect, analyticsController.getUserAnalytics);

// College analytics
router.get('/college', protect, analyticsController.getCollegeAnalytics);

module.exports = router;
