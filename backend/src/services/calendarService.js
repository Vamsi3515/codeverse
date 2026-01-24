const { google } = require('googleapis');

/**
 * Google Calendar Service
 * Handles Google Calendar API integration for hackathon reminders
 */

/**
 * Create Google Calendar OAuth2 client
 * @param {string} accessToken - User's Google access token
 * @returns {object} OAuth2 client
 */
const createOAuthClient = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  
  return oauth2Client;
};

/**
 * Add hackathon event to student's Google Calendar
 * @param {object} eventDetails - Hackathon event details
 * @param {string} accessToken - User's Google access token
 * @returns {object} Calendar event creation result
 */
const addEventToCalendar = async (eventDetails, accessToken, refreshToken) => {
  try {
    const {
      hackathonTitle,
      hackathonMode,
      startDateTime,
      endDateTime,
      organizerName,
      venue,
      platformLink,
      studentEmail
    } = eventDetails;

    // Create OAuth2 client with access + refresh tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Build event description
    let description = `Hackathon Mode: ${hackathonMode}\nOrganizer: ${organizerName}`;
    
    if (hackathonMode.toLowerCase() === 'offline' && venue) {
      description += `\n\nVenue: ${venue.venueName}`;
      description += `\nAddress: ${venue.address}, ${venue.city}`;
      if (venue.latitude && venue.longitude) {
        description += `\n\nView on Google Maps: https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`;
      }
    }
    
    if (hackathonMode.toLowerCase() === 'online' && platformLink) {
      description += `\n\nPlatform Link: ${platformLink}`;
    }

    // Create calendar event
    const event = {
      summary: hackathonTitle,
      description: description,
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Kolkata'
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Kolkata'
      },
      attendees: [
        { email: studentEmail }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 1440 },  // 24 hours before
          { method: 'popup', minutes: 60 },    // 1 hour before
          { method: 'popup', minutes: 10 }     // 10 minutes before
        ]
      },
      colorId: '9' // Blue color for hackathon events
    };

    // Check for duplicate events by summary near the given time window
    try {
      const existing = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date(new Date(startDateTime).getTime() - 5 * 60 * 1000).toISOString(),
        timeMax: new Date(new Date(endDateTime).getTime() + 5 * 60 * 1000).toISOString(),
        maxResults: 10,
        singleEvents: true,
        q: hackathonTitle
      });
      const dup = existing?.data?.items?.find(ev => ev.summary === hackathonTitle);
      if (dup) {
        return {
          success: true,
          eventId: dup.id,
          eventLink: dup.htmlLink,
          message: 'Event already exists in Google Calendar'
        };
      }
    } catch (listErr) {
      console.warn('⚠️ [CALENDAR] Duplicate check failed:', listErr?.message || listErr);
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all'
    });

    console.log('✅ [CALENDAR] Event created successfully:', response.data.id);
    
    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      message: 'Event added to Google Calendar successfully'
    };
  } catch (error) {
    console.error('❌ [CALENDAR] Error adding event:', error);
    
    // Handle specific errors
    if (error.code === 401) {
      // Attempt refresh using refresh token and retry once
      try {
        const refreshClient = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        );
        refreshClient.setCredentials({ refresh_token: refreshToken });
        const newAccess = await refreshClient.getAccessToken();
        const newAccessToken = newAccess?.token;
        if (newAccessToken) {
          const retryClient = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );
          retryClient.setCredentials({ access_token: newAccessToken });
          const retryCalendar = google.calendar({ version: 'v3', auth: retryClient });
          const retryResponse = await retryCalendar.events.insert({
            calendarId: 'primary',
            resource: event,
            sendUpdates: 'all'
          });
          return {
            success: true,
            eventId: retryResponse.data.id,
            eventLink: retryResponse.data.htmlLink,
            message: 'Event added to Google Calendar successfully',
            updatedAccessToken: newAccessToken
          };
        }
      } catch (refreshErr) {
        console.error('❌ [CALENDAR] Token refresh failed:', refreshErr);
      }
      return {
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Google Calendar access token expired. Please reconnect your account.'
      };
    }
    
    if (error.code === 403) {
      return {
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'Calendar access denied. Please grant calendar permissions.'
      };
    }
    
    return {
      success: false,
      error: 'CALENDAR_API_ERROR',
      message: error.message || 'Failed to add event to Google Calendar'
    };
  }
};

/**
 * Get Google OAuth2 authorization URL
 * @returns {string} Authorization URL
 */
const getAuthUrl = (state) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: state || undefined
  });

  return authUrl;
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from OAuth callback
 * @returns {object} Tokens
 */
const getTokensFromCode = async (code) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    return {
      success: true,
      tokens
    };
  } catch (error) {
    console.error('❌ [CALENDAR] Error getting tokens:', error);
    return {
      success: false,
      message: 'Failed to exchange authorization code for tokens'
    };
  }
};

module.exports = {
  addEventToCalendar,
  getAuthUrl,
  getTokensFromCode
};
