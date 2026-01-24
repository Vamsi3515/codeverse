const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const calendarService = require('../services/calendarService');
const User = require('../models/User');

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

    // Get student email
    const user = await User.findById(req.user.id).select('email googleAccessToken googleRefreshToken');
    if (!user) {
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
    const authUrl = calendarService.getAuthUrl(req.user.id);
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('❌ [CALENDAR AUTH] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
});

/**
 * @route   POST /api/calendar/callback
 * @desc    Handle Google OAuth callback and store tokens
 * @access  Protected
 */
router.post('/callback', protect, async (req, res) => {
  try {
    const { code } = req.body;

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

    // Store access token in user profile
    await User.findByIdAndUpdate(req.user.id, {
      googleAccessToken: result.tokens.access_token,
      googleRefreshToken: result.tokens.refresh_token
    });

    res.json({
      success: true,
      message: 'Google Calendar connected successfully'
    });
  } catch (error) {
    console.error('❌ [CALENDAR CALLBACK] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process OAuth callback'
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
    const user = await User.findById(req.user.id).select('googleAccessToken');
    
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
