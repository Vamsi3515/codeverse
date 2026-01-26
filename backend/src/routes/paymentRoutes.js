const express = require('express');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Protected routes (require authentication)
router.post('/create-order', protect, asyncHandler(paymentController.createOrder));
router.post('/verify-payment', protect, asyncHandler(paymentController.verifyPayment));
router.get('/status/:orderId', protect, asyncHandler(paymentController.getPaymentStatus));

// Webhook route (unprotected - Razorpay will call this)
router.post('/webhook/razorpay', asyncHandler(paymentController.handleWebhook));

module.exports = router;
