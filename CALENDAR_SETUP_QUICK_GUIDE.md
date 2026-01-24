# Google Calendar Integration - Quick Setup Guide

## What Was Built

✅ Google Calendar integration for hackathon registration reminders
✅ Automatic event creation with 3 reminders (24h, 1h, 10min)
✅ OAuth 2.0 authentication
✅ Beautiful success modal with calendar status
✅ Error handling and fallbacks

## Quick Start

### 1. Backend Setup

#### Install Package
```bash
npm install googleapis
```

#### Add Environment Variables to `.env`
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

#### Get Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (type: Web application)
5. Add authorized redirect URI: `http://localhost:5000/api/calendar/callback`
6. Copy Client ID and Secret to `.env`

### 2. Database Update

User model now includes:
```javascript
googleAccessToken: String
googleRefreshToken: String
```

These fields are automatically added when user completes OAuth flow.

### 3. Backend Routes Added

```
POST   /api/calendar/add-event      - Add hackathon to Google Calendar
GET    /api/calendar/auth-url       - Get OAuth authorization URL
POST   /api/calendar/callback       - Handle OAuth callback
GET    /api/calendar/status         - Check connection status
```

All routes require JWT authentication (token in Authorization header).

### 4. Frontend Features

#### User sees:
1. **Registration successful** ✅
2. **Calendar connected?**
   - Yes: "Event added to Google Calendar"
   - No: "Connect Google Calendar" button
3. **Reminder details**: "You'll receive reminders 24h, 1h, 10min before"

#### Calendar event includes:
- **Title**: Hackathon name
- **Time**: Start and end datetime
- **Reminders**: 24 hours, 1 hour, 10 minutes before
- **Description**: 
  - Hackathon mode (Online/Offline)
  - Organizer name
  - Venue details with Google Maps link (if offline)
  - Platform link (if online)

## File Changes

### Backend
```
✅ backend/src/services/calendarService.js       (NEW)
✅ backend/src/routes/calendarRoutes.js          (NEW)
✅ backend/src/models/User.js                    (MODIFIED)
✅ backend/src/index.js                          (MODIFIED - added route)
```

### Frontend
```
✅ frontend/src/components/RegistrationSuccessModal.jsx  (NEW)
✅ frontend/src/pages/StudentDashboard.jsx               (MODIFIED)
```

### Documentation
```
✅ GOOGLE_CALENDAR_INTEGRATION.md (NEW)
```

## User Flow

```
Student Registers
         ↓
Registration Success
         ↓
    Is Google Calendar Connected?
    ├─ YES: Auto-add to calendar → Show confirmation
    └─ NO: Show "Connect Google Calendar" button
         ↓
    Student Clicks Connect?
    ├─ YES: OAuth popup → Grant permissions → Event added
    └─ NO: Dismiss modal, registration still successful
```

## How Calendar Event Gets Created

```javascript
// 1. Student registers for hackathon
POST /api/registrations { hackathonId, teamId, ... }
Response: { success: true, hackathonId, ... }

// 2. Frontend calls calendar endpoint
POST /api/calendar/add-event
{
  hackathonTitle: "InnovateAI Hackathon",
  hackathonMode: "Online",
  startDateTime: "2026-01-25T10:00:00Z",
  endDateTime: "2026-01-26T18:00:00Z",
  organizerName: "Tech University",
  platformLink: "https://zoom.us/..."
}

// 3. Backend creates Google Calendar event
- Uses student's googleAccessToken
- Creates event with reminders
- Returns eventId and eventLink

// 4. Frontend shows success modal
- Displays "Event added to Google Calendar"
- Shows reminder times
- Provides link to calendar event
```

## Error Scenarios

| Scenario | What Happens | User Sees |
|----------|--------------|-----------|
| No Google Connection | Shows connect button | "Connect Google Calendar to get reminders" |
| User Denies Permission | Calendar section shows warning | "Calendar access denied" |
| Token Expired | Backend returns 401 | "Please reconnect your Google account" |
| Calendar API Down | Calendar optional, registration succeeds | "Calendar unavailable, registration complete" |

## Testing

### Test 1: First-Time User
1. Create new student account
2. Register for hackathon
3. Click "Connect Google Calendar"
4. Grant permissions
5. Verify event appears in Google Calendar
6. Check for 3 reminders

### Test 2: Already Connected
1. Login with connected account
2. Register for hackathon
3. Event should appear automatically
4. No need to reconnect

### Test 3: Offline Hackathon
1. Register for offline event
2. Verify venue details in calendar
3. Verify Google Maps link works

### Test 4: Error Handling
1. Revoke calendar permissions in Google account
2. Try to register
3. Should show permission error gracefully
4. Registration should still succeed

## Important Notes

⚠️ **Calendar is Optional**: Registration succeeds even if calendar integration fails
⚠️ **Timezone**: Hardcoded to Asia/Kolkata (can be customized)
⚠️ **Token Storage**: Access tokens stored in database (encrypted is recommended for production)
⚠️ **Permissions**: Student controls what calendar can see (ask only for calendar.events scope)

## Troubleshooting

**Q: "No Google Calendar Connected" error?**
- A: User needs to click "Connect Google Calendar" button first

**Q: Calendar event not appearing?**
- A: Check browser console for errors, verify token in database, check Google Cloud Console for API quota

**Q: Reminders not working?**
- A: Google Calendar reminders are browser popups - verify user has notifications enabled

**Q: "Invalid Redirect URI" error?**
- A: Add exact redirect URI to Google Cloud Console OAuth 2.0 settings

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Update `.env` with credentials
3. ✅ Deploy backend
4. ✅ Deploy frontend
5. ✅ Test with student account
6. ✅ Promote to production

---

**Status**: Ready for testing and deployment ✅
**Last Updated**: January 21, 2026
