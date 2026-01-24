const express = require('express');
const registrationController = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/verify-qr',
  protect,
  authorize('organizer', 'admin', 'ORGANIZER', 'STUDENT_COORDINATOR'),
  registrationController.verifyOfflineQr
);

module.exports = router;
