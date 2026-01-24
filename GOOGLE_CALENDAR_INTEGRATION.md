# Hackathon Reminder with Google Calendar Integration

**Status**: ✅ IMPLEMENTED

## Overview

Successfully implemented Google Calendar integration for hackathon registration reminders. Students can now automatically add registered hackathon events to their Google Calendar with multiple reminders (24h, 1h, 10 min before).

## Architecture

### Backend Components

#### 1. Calendar Service (`backend/src/services/calendarService.js`)
- **Purpose**: Google Calendar API integration via googleapis library
- **Functions**:
  - `addEventToCalendar()`: Creates event in Google Calendar with reminders
  - `getAuthUrl()`: Generates Google OAuth authorization URL
  - `getTokensFromCode()`: Exchanges OAuth code for access tokens
  - `createOAuthClient()`: Creates authenticated OAuth2 client

**Features**:
- Automatic reminder setup (24h, 1h, 10min before event)
- Event color coding (blue for hackathons)
- Venue location with Google Maps link (offline events)
- Platform link support (online events)
- Proper error handling for:
  - Token expiration (401)
  - Permission denied (403)
  - General API failures

#### 2. Calendar Routes (`backend/src/routes/calendarRoutes.js`)
- **POST /api/calendar/add-event**: Add hackathon event to Google Calendar
  - Requires: hackathonTitle, mode, dates, organizer, venue (if offline), platform (if online)
  - Returns: eventId, eventLink on success; error details on failure
  
- **GET /api/calendar/auth-url**: Get Google OAuth authorization URL
  - Used when user hasn't connected Google Calendar yet
  
- **POST /api/calendar/callback**: Handle OAuth callback and store tokens
  - Exchanges authorization code for access/refresh tokens
  - Stores tokens in user profile for future use
  
- **GET /api/calendar/status**: Check if user has connected Google Calendar
  - Returns: { connected: boolean }

**Authentication**: All routes protected with `protect` middleware (JWT token required)

#### 3. User Model Update (`backend/src/models/User.js`)
Added fields:
```javascript
googleAccessToken: { type: String, select: false },
googleRefreshToken: { type: String, select: false }
```

### Frontend Components

#### 1. Registration Success Modal (`frontend/src/components/RegistrationSuccessModal.jsx`)
- **Props**:
  - `open`: Boolean - show/hide modal
  - `hackathon`: Object - registered hackathon details
  - `registration`: Object - registration data
  - `calendarStatus`: Object - calendar connection status
  - `onClose`: Function - close handler

- **Features**:
  - Success confirmation message
  - Hackathon details display (mode, start time, venue)
  - Calendar connection status:
    - ✅ Connected: Shows confirmation with reminder details
    - ❌ Not Connected: Shows "Connect Google Calendar" button
  - Prompts user to check email for confirmation
  - Navigate to dashboard on close

#### 2. StudentDashboard Integration (`frontend/src/pages/StudentDashboard.jsx`)
Updated to handle calendar integration:

**New State**:
```javascript
const [registrationSuccessModal, setRegistrationSuccessModal] = useState({
  open: false,
  hackathon: null,
  registration: null,
  calendarStatus: null
})
```

**New Functions**:
- `handleRegistrationSuccess()`: Updated to trigger calendar integration
- `checkCalendarStatus()`: Fetch current calendar connection status
- `addHackathonToCalendar()`: Call calendar API endpoint and handle response

**Flow**:
1. Student clicks "Register" → TeamRegistrationModal opens
2. Registration succeeds → `handleRegistrationSuccess()` called
3. Check calendar status via `/api/calendar/status`
4. Attempt to add event via `POST /api/calendar/add-event`
5. Show RegistrationSuccessModal with:
   - Success confirmation
   - Calendar status
   - Option to connect Google Calendar if not done
   - Navigation to dashboard

## Google Calendar Event Details

### Event Structure
```javascript
{
  summary: "Hackathon Title",
  description: "Hackathon Mode: Online/Offline\nOrganizer: Name\nVenue/Link: Details",
  start: { dateTime: ISO8601, timeZone: "Asia/Kolkata" },
  end: { dateTime: ISO8601, timeZone: "Asia/Kolkata" },
  attendees: [{ email: student@example.com }],
  reminders: {
    useDefault: false,
    overrides: [
      { method: "popup", minutes: 1440 },  // 24 hours
      { method: "popup", minutes: 60 },    // 1 hour
      { method: "popup", minutes: 10 }     // 10 minutes
    ]
  },
  colorId: "9"  // Blue
}
```

### Offline Event (with venue)
Description includes:
- Venue name
- Address and city
- Google Maps link: `https://www.google.com/maps?q=latitude,longitude`

### Online Event (with platform)
Description includes:
- Platform link (Zoom/Meet/Custom URL)

## Error Handling

### Backend Errors

| Error | Status | Message | Action |
|-------|--------|---------|--------|
| NO_GOOGLE_TOKEN | 403 | No Google Calendar connection | Provide authUrl for user to connect |
| TOKEN_EXPIRED | 401 | Access token expired | Prompt user to reconnect |
| PERMISSION_DENIED | 403 | Calendar access denied | Ask user to grant permissions |
| CALENDAR_API_ERROR | 400 | Generic API failure | Show error message |

### Frontend Handling

1. **No Google Calendar Connection**:
   - Show "Connect Google Calendar" button
   - User clicks → Opens OAuth popup
   - After auth → Event is created automatically

2. **Token Expired**:
   - Prompt user to reconnect Google Calendar
   - Provide re-authentication link

3. **Permission Denied**:
   - User can still register without calendar
   - Show warning: "Calendar access denied. You can add manually."

4. **API Failure**:
   - Show friendly error message
   - Keep registration successful (calendar is optional)

## User Flow

### First Time User (No Google Calendar)

1. Student clicks "Register" for hackathon
2. Fills registration details and submits
3. Success modal appears:
   - "Registration Successful ✅"
   - Shows "Connect Google Calendar" button
4. Student clicks button → OAuth popup opens
5. Student grants permissions
6. Event automatically added to calendar
7. Student sees confirmation with reminder details
8. Receives 24h, 1h, 10min reminders from Google Calendar

### Returning User (Google Calendar Connected)

1. Student clicks "Register" for hackathon
2. Fills registration details and submits
3. Success modal appears with calendar connected status
4. Event immediately added to Google Calendar
5. Reminders automatically set
6. Success message with event details
7. Click "Go to Dashboard" to proceed

## Dependencies

### Backend
- `googleapis@^118.0.0`: Google APIs client library
- Existing: express, mongoose, dotenv, etc.

### Frontend
- React 19 (existing)
- React Router v6 (existing)

## Environment Variables (Backend)

Required in `.env`:
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

**Setup**:
1. Create Google OAuth 2.0 credentials in Google Cloud Console
2. Set redirect URI to `http://localhost:5000/api/calendar/callback`
3. Add credentials to `.env`

## Testing Checklist

- [ ] Student can register for hackathon
- [ ] Success modal appears immediately
- [ ] "Connect Google Calendar" button works
- [ ] Google OAuth popup opens and user can grant permissions
- [ ] Calendar event created with correct details
- [ ] Event shows in Google Calendar
- [ ] Reminders set correctly (24h, 1h, 10min)
- [ ] Offline hackathon includes venue and Google Maps link
- [ ] Online hackathon includes platform link
- [ ] Error handling works for expired tokens
- [ ] Error handling works for permission denied
- [ ] Calendar integration is optional (registration succeeds even if calendar fails)

## Notes

- Calendar integration is **optional** - students can register without connecting Google Calendar
- Events are created with student's email as attendee
- Reminders are browser popups (student can configure in Google Calendar settings)
- Event color is set to blue for easy identification
- Timezone hardcoded to `Asia/Kolkata` (can be made configurable)
- All calendar operations require valid JWT token in Authorization header

## Future Enhancements

1. Allow students to disconnect Google Calendar
2. Let users customize reminder times
3. Support multiple calendar languages/timezones
4. Add email reminders in addition to popup
5. Create calendar for organizers to see all registrations
6. Sync calendar with team members
7. Add calendar to QR code for offline hackathons
