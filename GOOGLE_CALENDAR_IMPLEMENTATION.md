# 📅 Google Calendar Integration - Complete Implementation Guide

## ✅ What's Been Implemented

### Frontend (StudentDashboard.jsx)
- ✅ Calendar permission popup modal in RegistrationSuccessModal
- ✅ "Connect Calendar" button with OAuth flow
- ✅ "Skip for Now" option to bypass calendar
- ✅ Success screen after calendar connection
- ✅ Reminder display (24hrs, 1hr, 10mins before event)

### Backend
- ✅ calendarService.js - Google Calendar API integration
- ✅ calendarRoutes.js - OAuth endpoints
- ✅ User model fields: googleAccessToken, googleRefreshToken
- ✅ Automatic event creation with 3 reminders
- ✅ Token refresh handling for expired tokens

### Integration Points
- ✅ Routes mounted on `/api/calendar` and `/api/google-calendar`
- ✅ Protected endpoints with JWT authentication
- ✅ OAuth callback handling
- ✅ Event creation with proper reminders

---

## 🚀 How to Enable Google Calendar Integration

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project named `CodeVerse Campus`
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID** → **Web application**
5. Add authorized redirect URI:
   ```
   http://localhost:5000/api/calendar/callback
   ```
6. Copy **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Edit `backend/.env.local` and replace placeholders:

```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

### Step 4: Test the Integration

1. **Go to Student Dashboard**
2. **Register for a hackathon**
3. **Click "Connect Calendar"** in the success modal
4. **Login with your Google account**
5. **Grant calendar permissions**
6. **See "Calendar Connected! 📅" message**
7. **Open your Google Calendar** → The hackathon event appears with reminders!

---

## 📋 API Endpoints

### 1. Get OAuth Authorization URL
```
POST /api/calendar/auth-url
Authentication: Required (Bearer token)

Response:
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### 2. OAuth Callback (Automatic)
```
GET /api/calendar/callback?code={authorization_code}
(User is automatically redirected by Google)
```

### 3. Add Event to Google Calendar
```
POST /api/calendar/add-event
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json

Body:
{
  "hackathonTitle": "GenAiVersity",
  "hackathonMode": "online",
  "startDateTime": "2026-01-25T14:07:00Z",
  "endDateTime": "2026-01-28T06:11:00Z",
  "organizerName": "CodeVerse",
  "venue": "Tech Hub, Delhi"
}

Response:
{
  "success": true,
  "message": "Event added to Google Calendar successfully",
  "eventId": "abc123...",
  "eventLink": "https://calendar.google.com/calendar/r/events/abc123"
}
```

### 4. Check Calendar Status
```
GET /api/calendar/status
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "connected": true,
  "lastSync": "2026-01-25T12:00:00Z"
}
```

### 5. Disconnect Calendar
```
POST /api/calendar/disconnect
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Google Calendar disconnected"
}
```

---

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Student Registers for Hackathon                             │
│ (Click "Register" on available hackathon)                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Registration Submitted & Processed                          │
│ (QR code generated for offline hackathons)                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Registration Success Modal Opens                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✅ Registration Successful                              │ │
│ │                                                          │ │
│ │ Hackathon: GenAiVersity                                │ │
│ │ Mode: Online                                            │ │
│ │ Date: Jan 25, 2026, 2:07 PM                            │ │
│ │                                                          │ │
│ │ [QR Code Display - for offline hackathons]             │ │
│ │                                                          │ │
│ │            [Continue →]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Calendar Permission Modal Appears                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📅 Add to Google Calendar?                              │ │
│ │                                                          │ │
│ │ Connect your Google Calendar to automatically add       │ │
│ │ this hackathon. You'll receive reminders before        │ │
│ │ the event.                                              │ │
│ │                                                          │ │
│ │ You will receive reminders:                            │ │
│ │ • 24 hours before the event                           │ │
│ │ • 1 hour before the event                             │ │
│ │ • 10 minutes before the event                         │ │
│ │                                                          │ │
│ │  [Skip for Now]  [Connect Calendar]                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                    ↙️              ↘️
          [Skip Clicked]      [Connect Clicked]
              ↓                      ↓
        Go to Dashboard      Google OAuth Popup
                            (User logs in & grants permissions)
                                    ↓
                    Backend receives authorization code
                                    ↓
                    Backend exchanges for access tokens
                                    ↓
                    Backend creates calendar event with:
                    • Event title & description
                    • Hackathon start/end dates
                    • 3 automatic reminders
                                    ↓
┌─────────────────────────────────────────────────────────────┐
│ Calendar Connected Success Screen                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✅ Calendar Connected! 📅                               │ │
│ │                                                          │ │
│ │ The hackathon has been added to your Google Calendar.  │ │
│ │ You'll receive reminders automatically.                 │ │
│ │                                                          │ │
│ │              [Go to Dashboard]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Close Modal & Return to Dashboard
```

---

## 🔧 Configuration Details

### Reminder Configuration
Located in `backend/src/services/calendarService.js` (line ~70):

```javascript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'notification', minutes: 24 * 60 }, // 24 hours before
    { method: 'notification', minutes: 60 },       // 1 hour before
    { method: 'notification', minutes: 10 }        // 10 minutes before
  ]
}
```

**To customize reminders**, edit the `overrides` array:
```javascript
overrides: [
  { method: 'notification', minutes: 48 * 60 }, // 2 days before
  { method: 'email', minutes: 24 * 60 },         // 1 day before (email)
  { method: 'notification', minutes: 30 }        // 30 minutes before
]
```

### Event Description Template
The calendar event includes:
- **Event Title**: 🔥 {HackathonTitle}
- **Description**: Event details and registration info
- **Time**: Hackathon start and end dates
- **Reminders**: 3 automatic notifications

### Token Management
- **Access Token**: Used for calendar operations (expires in ~1 hour)
- **Refresh Token**: Stored securely in database for obtaining new access tokens
- **Automatic Refresh**: System attempts token refresh when creating events if access token expired
- **User Prompted**: If refresh fails, user must reconnect calendar

---

## 🐛 Troubleshooting

### Error: "Google Calendar not configured"
**Cause**: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local
**Fix**: 
1. Add credentials to .env.local
2. Restart backend: `npm start`

### Error: "Failed to generate authentication URL"
**Cause**: Backend environment variables not loaded
**Fix**:
1. Check .env.local has Google credentials
2. Verify GOOGLE_REDIRECT_URI matches (http://localhost:5000/api/calendar/callback)
3. Restart backend

### Error: "Please connect your Google Calendar first"
**Cause**: User hasn't authenticated yet
**Fix**: Click "Connect Calendar" button to start OAuth flow

### Popup doesn't open
**Cause**: Browser blocked popup
**Fix**: Allow popups for localhost:5173 in browser settings

### Event not appearing in calendar
**Cause 1**: User didn't grant calendar permissions
**Fix**: Click "Connect Calendar" and grant full calendar access

**Cause 2**: Event date is in the past
**Fix**: Create hackathon with future dates

**Cause 3**: Google tokens invalid/expired
**Fix**: Disconnect and reconnect calendar

### "Calendar access token expired"
**Cause**: User's Google access token expired (normal after ~1 hour)
**Fix**: 
- System attempts automatic refresh
- If that fails, user sees error
- User needs to click "Connect Calendar" again to re-authenticate

---

## 📊 Testing Checklist

- [ ] Google credentials added to .env.local
- [ ] Backend restarted after env changes
- [ ] Student can register for hackathon
- [ ] Registration success modal shows
- [ ] "Connect Calendar" button works
- [ ] Google OAuth popup opens
- [ ] Can login with Google account
- [ ] Calendar permission request shows
- [ ] After granting permission, success screen shows
- [ ] Event appears in Google Calendar
- [ ] Event has correct hackathon title
- [ ] Event has correct date/time
- [ ] Event has all 3 reminders (24h, 1h, 10m)
- [ ] Clicking "Skip for Now" skips calendar connection
- [ ] Can disconnect calendar from settings (future feature)
- [ ] Multiple hackathons can have separate calendar events

---

## 🔐 Security Notes

- **Tokens are never exposed to frontend** - All OAuth happens server-side
- **Access tokens are stored with `select: false`** - Not returned in API responses
- **Tokens are refreshed automatically** - User doesn't need to manually re-authenticate
- **HTTPS only in production** - Redirect URI must use https for production deployments
- **Scope is minimal** - Only calendar.events and calendar scopes requested

---

## 📱 Production Deployment

When deploying to production:

1. **Update redirect URI** in Google Cloud Console:
   ```
   https://your-domain.com/api/calendar/callback
   ```

2. **Update .env.local** on production server:
   ```env
   BACKEND_URL=https://your-domain.com
   GOOGLE_REDIRECT_URI=https://your-domain.com/api/calendar/callback
   FRONTEND_URL=https://your-domain.com
   ```

3. **Use HTTPS** everywhere - Google OAuth requires secure connections

4. **Test thoroughly** - Test calendar connection before going live

---

## 📚 Related Files

- **Frontend**: `/src/pages/StudentDashboard.jsx`
- **Frontend**: `/src/components/RegistrationSuccessModal.jsx`
- **Backend**: `/src/services/calendarService.js`
- **Backend**: `/src/routes/calendarRoutes.js`
- **Backend**: `/src/models/User.js` (googleAccessToken, googleRefreshToken)
- **Config**: `/.env.local`

---

## 🎯 Next Steps

Once Google Calendar integration is working:

1. ✅ **Calendar integration** (THIS FEATURE)
2. **Email notifications** - Send email reminders in addition to calendar
3. **Calendar management** - Allow users to view/edit/disconnect calendars
4. **Multiple calendars** - Support different calendars for different event types
5. **Timezone handling** - Auto-detect user timezone for reminders
6. **iCal export** - Generate .ics files for manual import

---

## 💡 Tips

- Test with future-dated hackathons to see reminders work
- Google Calendar app on mobile will show reminders too
- Users can customize reminder settings in Google Calendar
- Calendar events sync across all devices with Google account
- Students can share their calendar to show hackathon availability to friends

