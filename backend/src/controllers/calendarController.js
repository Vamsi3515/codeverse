// Google Calendar Controller
// Handles OAuth, token management, and calendar event creation

const { google } = require('googleapis');
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/calendar/callback`;

// Initialize OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

/**
 * Get Google OAuth Authorization URL
 * Redirects user to Google login
 */
exports.getAuthUrl = (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google Calendar not configured. Please contact support.' 
      });
    }

    const oauth2Client = getOAuth2Client();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      prompt: 'consent'
    });

    console.log('✅ [GOOGLE CALENDAR] Auth URL generated for user:', req.user.id);

    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('❌ [GOOGLE CALENDAR] Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication URL'
    });
  }
};

/**
 * Google OAuth Callback
 * Exchanges authorization code for access token
 */
exports.handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code not provided' 
      });
    }

    const oauth2Client = getOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    console.log('✅ [GOOGLE CALENDAR] Tokens obtained, code:', code.substring(0, 10) + '...');

    // Get user info from token
    oauth2Client.setCredentials(tokens);

    // Store tokens in session/database
    // For now, store in session
    req.session.googleTokens = tokens;

    // Redirect back to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard/student?calendar=connected`);
  } catch (error) {
    console.error('❌ [GOOGLE CALENDAR] OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard/student?calendar=error`);
  }
};

/**
 * Create Calendar Event with Reminders
 * Adds hackathon to user's Google Calendar
 */
exports.createCalendarEvent = async (req, res) => {
  try {
    const { hackathonId, hackathonTitle, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!hackathonId || !hackathonTitle || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required hackathon details'
      });
    }

    // Get user's stored Google tokens
    const user = await User.findById(userId);
    
    if (!user || !user.googleTokens) {
      return res.status(401).json({
        success: false,
        message: 'Google Calendar not connected. Please authenticate first.'
      });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(user.googleTokens);

    // Create calendar service
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Prepare event details
    const event = {
      summary: `🔥 ${hackathonTitle}`,
      description: `Hackathon: ${hackathonTitle}\n\nYou have successfully registered. Check your registration details and complete any prerequisites.`,
      start: {
        dateTime: new Date(startDate).toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: new Date(endDate || new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000)).toISOString(),
        timeZone: 'Asia/Kolkata'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'notification', minutes: 24 * 60 }, // 24 hours before
          { method: 'notification', minutes: 60 },       // 1 hour before
          { method: 'notification', minutes: 10 }        // 10 minutes before
        ]
      }
    };

    // Create the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendNotifications: true
    });

    console.log('✅ [GOOGLE CALENDAR] Event created:', {
      eventId: response.data.id,
      hackathon: hackathonTitle,
      user: userId
    });

    // Save event ID to user's registrations
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          lastGoogleCalendarEventId: response.data.id,
          lastCalendarSync: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Hackathon added to Google Calendar with reminders',
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    });

  } catch (error) {
    console.error('❌ [GOOGLE CALENDAR] Error creating event:', error);
    
    // Check if it's a token expiration error
    if (error.message.includes('invalid_grant') || error.message.includes('Token')) {
      return res.status(401).json({
        success: false,
        message: 'Your Google Calendar connection expired. Please reconnect.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add event to Google Calendar'
    });
  }
};

/**
 * Disconnect Google Calendar
 * Removes stored tokens
 */
exports.disconnectCalendar = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.updateOne(
      { _id: userId },
      {
        $unset: {
          googleTokens: 1,
          lastCalendarSync: 1
        }
      }
    );

    console.log('✅ [GOOGLE CALENDAR] Calendar disconnected for user:', userId);

    res.json({
      success: true,
      message: 'Google Calendar disconnected'
    });
  } catch (error) {
    console.error('❌ [GOOGLE CALENDAR] Error disconnecting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Google Calendar'
    });
  }
};

/**
 * Check if Calendar is Connected
 */
exports.checkCalendarStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const isConnected = !!(user && user.googleTokens);

    res.json({
      success: true,
      connected: isConnected,
      lastSync: user?.lastCalendarSync || null
    });
  } catch (error) {
    console.error('❌ [GOOGLE CALENDAR] Error checking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check calendar status'
    });
  }
};
