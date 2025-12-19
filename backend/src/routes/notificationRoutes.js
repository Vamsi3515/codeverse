const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Notifications
router.get('/', protect, notificationController.getNotifications);
router.get('/unread/count', protect, notificationController.getUnreadCount);
router.put('/:notificationId/read', protect, notificationController.markNotificationAsRead);
router.put('/mark-all-read', protect, notificationController.markAllNotificationsAsRead);
router.delete('/:notificationId', protect, notificationController.deleteNotification);

// Organizer notifications
router.post('/hackathon/:hackathonId/send-reminders', protect, authorize('organizer', 'admin'), notificationController.sendRegistrationReminders);
router.post('/hackathon/:hackathonId/send-start', protect, authorize('organizer', 'admin'), notificationController.sendEventStartNotifications);

module.exports = router;
