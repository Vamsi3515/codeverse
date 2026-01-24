const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const calendarService = require('../services/calendarService');
const User = require('../models/User');

/**
 * @route   POST /api/google-calendar/auth
 * @desc    Initiate Google OAuth and return consent URL (includes state=userId)
 * @access  Protected
 */
router.post('/auth', protect, async (req, res) => {
  try {
    const authUrl = calendarService.getAuthUrl(req.user.id);
    res.json({ success: true, authUrl });
  } catch (error) {
    console.error('❌ [GOOGLE CALENDAR AUTH] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate Google OAuth' });
  }
});

/**
 * @route   GET /api/google-calendar/callback
 * @desc    OAuth redirect handler: exchange code, store tokens, and close popup
 * @access  Public (uses state=userId)
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }

    const result = await calendarService.getTokensFromCode(code);
    if (!result.success) {
      return res.status(400).send('Failed to exchange authorization code');
    }

    await User.findByIdAndUpdate(state, {
      googleAccessToken: result.tokens.access_token,
      googleRefreshToken: result.tokens.refresh_token
    });

    // Return a small HTML to notify opener and close
    return res.send(`<!DOCTYPE html><html><body><script>
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_CALENDAR_CONNECTED', success: true }, '*');
      }
      window.close();
    </script>Connected. You can close this window.</body></html>`);
  } catch (error) {
    console.error('❌ [GOOGLE CALENDAR CALLBACK] Error:', error);
    return res.status(500).send('OAuth callback processing failed');
  }
});

/**
 * @route   POST /api/google-calendar/add-event
 * @desc    Add hackathon event to Google Calendar with reminders
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

    if (!hackathonTitle || !hackathonMode || !startDateTime || !endDateTime || !organizerName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findById(req.user.id).select('email googleAccessToken googleRefreshToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.googleAccessToken && !user.googleRefreshToken) {
      return res.status(403).json({
        success: false,
        error: 'NO_GOOGLE_TOKEN',
        message: 'Please connect your Google Calendar first',
        authUrl: calendarService.getAuthUrl(req.user.id)
      });
    }

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

    const result = await calendarService.addEventToCalendar(
      eventDetails,
      user.googleAccessToken,
      user.googleRefreshToken
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, message: result.message });
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
    console.error('❌ [GOOGLE CALENDAR ADD EVENT] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add event to calendar' });
  }
});

module.exports = router;