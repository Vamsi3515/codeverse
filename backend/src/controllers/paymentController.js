const crypto = require('crypto');
const Razorpay = require('razorpay');
const Registration = require('../models/Registration');
const Student = require('../models/Student');
const Hackathon = require('../models/Hackathon');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create payment order
 * POST /payments/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { hackathonId, amount, registrationType, teamData } = req.body;
    const userId = req.user.id;

    console.log('💳 [PAYMENT] Creating order:', {
      hackathonId,
      amount,
      registrationType,
      userId
    });

    // Validate input
    if (!hackathonId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hackathon ID or amount'
      });
    }

    // Verify hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: `receipt_${hackathonId}_${userId}_${Date.now()}`,
      notes: {
        hackathonId,
        userId,
        registrationType,
        hackathonTitle: hackathon.title
      }
    };

    console.log('🔄 [RAZORPAY] Creating order with options:', options);

    const order = await razorpay.orders.create(options);

    console.log('✅ [RAZORPAY] Order created:', order.id);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: amount,
      currency: 'INR'
    });
  } catch (error) {
    console.error('❌ [PAYMENT] Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * Verify payment signature and register user
 * POST /payments/verify-payment
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      hackathonId,
      registrationType,
      teamData
    } = req.body;
    const userId = req.user.id;

    console.log('🔐 [PAYMENT] Verifying payment:', {
      orderId,
      paymentId,
      hackathonId,
      registrationType,
      userId
    });

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ [PAYMENT] Invalid signature');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    console.log('✅ [PAYMENT] Signature verified');

    // Verify hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      hackathonId,
      userId
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this hackathon'
      });
    }

    // Get student profile for registration details
    const studentProfile = await Student.findById(userId);
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Prepare registration data with payment info
    const studentName = `${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`.trim();
    const { v4: uuidv4 } = require('uuid');
    const qrToken = hackathon.mode === 'offline' ? uuidv4() : undefined;

    let registrationData = {
      hackathonId,
      organizerId: hackathon.organizerId || hackathon.organizer,
      userId,
      studentName,
      rollNumber: studentProfile.regNumber || '',
      selfieUrl: studentProfile.liveSelfie || '',
      participationType: registrationType,
      status: 'registered',
      paymentStatus: 'completed',
      paymentId,
      amountPaid: hackathon.registrationFee,
      emailVerified: studentProfile.emailVerified || studentProfile.isEmailVerified,
      qrToken,
      qrIssuedAt: qrToken ? new Date() : undefined
    };

    // Add team data if TEAM registration
    if (registrationType === 'TEAM' && teamData) {
      registrationData.team = {
        teamName: teamData.teamName,
        leader: {
          studentId: userId,
          email: studentProfile.email,
          rollNumber: studentProfile.regNumber || teamData.leaderRollNumber || ''
        },
        members: teamData.members.map(member => ({
          email: member.email,
          rollNumber: member.rollNumber,
          status: 'CONFIRMED'
        }))
      };
      registrationData.isTeamLead = true;
    }

    const registration = new Registration(registrationData);
    await registration.save();

    console.log('✅ [REGISTRATION] Registration created after payment:', registration._id);

    // Generate QR code for offline hackathons
    if (hackathon.mode === 'offline' && registration.qrToken) {
      try {
        const QRCode = require('qrcode');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const registrationPageUrl = `${frontendUrl}/registration/verify/${registration._id}`;
        
        const qrCodeImage = await QRCode.toDataURL(registrationPageUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        registration.qrCode = qrCodeImage;
        await registration.save();
        console.log('✅ [QR CODE] QR code generated and saved');
      } catch (qrErr) {
        console.warn('⚠️ [QR CODE] Failed to generate QR code:', qrErr.message);
      }
    }

    // Update hackathon registered count
    hackathon.registeredCount += 1;
    await hackathon.save();

    // Update user's participation count
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      user.totalHackathonsParticipated = (user.totalHackathonsParticipated || 0) + 1;
      await user.save();
    }

    res.status(200).json({
      success: true,
      registration: {
        _id: registration._id,
        hackathonId: registration.hackathonId,
        status: registration.status,
        paymentStatus: registration.paymentStatus,
        teamName: registration.team?.teamName || null
      },
      message: 'Payment verified and registration completed'
    });
  } catch (error) {
    console.error('❌ [PAYMENT] Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * Get payment status
 * GET /payments/status/:orderId
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('🔍 [PAYMENT] Checking payment status for order:', orderId);

    const order = await razorpay.orders.fetch(orderId);

    res.status(200).json({
      success: true,
      status: order.status,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('❌ [PAYMENT] Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
      error: error.message
    });
  }
};

// Webhook handler for Razorpay payment notifications
exports.handleWebhook = async (req, res) => {
  try {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      console.error('❌ [WEBHOOK] Signature mismatch - unauthorized request');
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    console.log('✅ [WEBHOOK] Signature verified, processing:', req.body.event);

    const event = req.body.event;
    const data = req.body.payload;

    if (event === 'payment.authorized') {
      const paymentId = data.payment.entity.id;
      const orderId = data.payment.entity.order_id;
      const amount = data.payment.entity.amount;

      console.log('💳 [WEBHOOK] Payment authorized:', {
        paymentId,
        orderId,
        amount: amount / 100 + ' INR'
      });

      // Update payment status in database (optional - for logging purposes)
      // Could add a Payment model to track webhook receipts
      res.status(200).json({
        success: true,
        message: 'Payment authorized webhook received'
      });
    } 
    else if (event === 'payment.failed') {
      const paymentId = data.payment.entity.id;
      const orderId = data.payment.entity.order_id;
      const error = data.payment.entity.error_description;

      console.error('❌ [WEBHOOK] Payment failed:', {
        paymentId,
        orderId,
        error
      });

      res.status(200).json({
        success: true,
        message: 'Payment failed webhook received'
      });
    }
    else if (event === 'payment.captured') {
      const paymentId = data.payment.entity.id;
      const orderId = data.payment.entity.order_id;
      const amount = data.payment.entity.amount;

      console.log('✅ [WEBHOOK] Payment captured:', {
        paymentId,
        orderId,
        amount: amount / 100 + ' INR'
      });

      res.status(200).json({
        success: true,
        message: 'Payment captured webhook received'
      });
    }
    else {
      console.log('📋 [WEBHOOK] Unhandled event:', event);
      res.status(200).json({
        success: true,
        message: 'Webhook received'
      });
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};
