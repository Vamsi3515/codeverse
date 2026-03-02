const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const calendarService = require('../services/calendarService');
const User = require('../models/User');
const Student = require('../models/Student');
const Organizer = require('../models/Organizer');

/**
 * @route   POST /api/calendar/add-event
 * @desc    Add hackathon event to student's Google Calendar
 * @access  Protected
 */
router.post('/add-event', protect, async (req, res) => {
  try {
    const {
      hackathonTitle,
      hackathonMode,
      startDateTime,
      endDateTime,
      organizerName,
      venue,
      platformLink
    } = req.body;

    // Validate required fields
    if (!hackathonTitle || !hackathonMode || !startDateTime || !endDateTime || !organizerName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    console.log('📅 [ADD EVENT] User role source:', req.user.roleSource);

    // Get student email and tokens from the correct model
    let user;
    if (req.user.roleSource === 'organizer') {
      user = await Organizer.findById(req.user.id).select('email googleAccessToken googleRefreshToken');
      console.log('📅 [ADD EVENT] Searching in Organizer model');
    } else {
      user = await Student.findById(req.user.id).select('email googleAccessToken googleRefreshToken');
      console.log('📅 [ADD EVENT] Searching in Student model');
    }

    if (!user) {
      console.error('❌ [ADD EVENT] User not found for ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has connected Google Calendar
    if (!user.googleAccessToken && !user.googleRefreshToken) {
      return res.status(403).json({
        success: false,
        error: 'NO_GOOGLE_TOKEN',
        message: 'Please connect your Google Calendar first',
        authUrl: calendarService.getAuthUrl(req.user.id)
      });
    }

    // Prepare event details
    const eventDetails = {
      hackathonTitle,
      hackathonMode,
      startDateTime,
      endDateTime,
      organizerName,
      venue,
      platformLink,
      studentEmail: user.email
    };

    // Add event to Google Calendar
    const result = await calendarService.addEventToCalendar(
      eventDetails,
      user.googleAccessToken,
      user.googleRefreshToken
    );

    if (!result.success) {
      // If token expired, prompt user to reconnect
      if (result.error === 'TOKEN_EXPIRED') {
        return res.status(401).json({
          success: false,
          error: 'TOKEN_EXPIRED',
          message: result.message,
          authUrl: calendarService.getAuthUrl()
        });
      }

      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

    // Persist refreshed access token if provided
    if (result.updatedAccessToken) {
      await User.findByIdAndUpdate(req.user.id, { googleAccessToken: result.updatedAccessToken });
    }

    res.json({
      success: true,
      message: result.message || 'Event added to Google Calendar successfully',
      eventId: result.eventId,
      eventLink: result.eventLink
    });
  } catch (error) {
    console.error('❌ [CALENDAR API] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add event to calendar'
    });
  }
});

/**
 * @route   GET /api/calendar/auth-url
 * @desc    Get Google OAuth authorization URL
 * @access  Protected
 */
router.get('/auth-url', protect, (req, res) => {
  try {
    console.log('📅 [CALENDAR AUTH] GET /auth-url called for user:', req.user.id);
    const authUrl = calendarService.getAuthUrl(req.user.id);
    console.log('✅ [CALENDAR AUTH] Auth URL generated, sending to frontend');
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('❌ [CALENDAR AUTH] Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate authorization URL'
    });
  }
});

/**
 * @route   GET /api/calendar/callback
 * @desc    Handle Google OAuth callback and store tokens
 * @access  Public (called by Google OAuth redirect)
 */
router.get('/callback', async (req, res) => {
  try {
    // Get code from query parameters (Google sends it as ?code=...)
    const { code, state } = req.query;

    console.log('📅 [CALENDAR CALLBACK] Received code:', code ? 'YES' : 'NO');

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for tokens
    const result = await calendarService.getTokensFromCode(code);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    console.log('✅ [CALENDAR CALLBACK] Code exchanged for tokens');

    // Get userId from state parameter (should be encoded in state by frontend)
    // For now, we'll decode from the authorization code metadata
    // Or you can parse the state parameter if it contains userId
    
    // Since we don't have userId here, we need to send the tokens to frontend
    // The frontend will send them back with user context
    
    // Redirect to frontend with success and tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/calendar-callback?accessToken=${result.tokens.access_token}&refreshToken=${result.tokens.refresh_token}&success=true`);

  } catch (error) {
    console.error('❌ [CALENDAR CALLBACK] Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/calendar-callback?success=false&error=${error.message}`);
  }
});

/**
 * @route   POST /api/calendar/callback
 * @desc    Store tokens received from frontend after OAuth callback
 * @access  Protected
 */
router.post('/callback', protect, async (req, res) => {
  try {
    const { accessToken, refreshToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    console.log('💾 [CALENDAR CALLBACK] Storing tokens for user:', req.user.id);
    console.log('   Role source:', req.user.roleSource);

    let updatedUser;
    
    // Store tokens in the correct model based on roleSource
    if (req.user.roleSource === 'organizer') {
      updatedUser = await Organizer.findByIdAndUpdate(
        req.user.id,
        {
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        },
        { new: true }
      );
      console.log('✅ Tokens stored in Organizer model');
    } else {
      // Default to Student
      updatedUser = await Student.findByIdAndUpdate(
        req.user.id,
        {
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        },
        { new: true }
      );
      console.log('✅ Tokens stored in Student model');
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Google Calendar connected successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ [CALENDAR CALLBACK POST] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store tokens'
    });
  }
});

/**
 * @route   GET /api/calendar/status
 * @desc    Check if user has connected Google Calendar
 * @access  Protected
 */
router.get('/status', protect, async (req, res) => {
  try {
    let user;
    
    // Check the correct model based on roleSource
    if (req.user.roleSource === 'organizer') {
      user = await Organizer.findById(req.user.id).select('googleAccessToken');
    } else {
      user = await Student.findById(req.user.id).select('googleAccessToken');
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      connected: !!user.googleAccessToken
    });
  } catch (error) {
    console.error('❌ [CALENDAR STATUS] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check calendar status'
    });
  }
});

module.exports = router;
