# 🔐 Google Calendar OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Enter project name: `CodeVerse Campus`
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, search for "Google Calendar API"
2. Click on it and press "Enable"
3. Wait for it to be enabled

## Step 3: Create OAuth 2.0 Credentials

1. Go to **Credentials** section (left sidebar)
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Choose **"Web application"**
4. Add authorized redirect URIs:
   ```
   http://localhost:5000/api/calendar/callback
   https://your-domain.com/api/calendar/callback
   ```
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 4: Update Environment Variables

Add these to your `.env.local` file in the backend:

```env
# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
BACKEND_URL=http://localhost:5000
```

## Step 5: Test the Integration

1. Start your backend: `npm start`
2. Go to student dashboard
3. Register for a hackathon
4. In the success modal, click "Connect Calendar"
5. You'll be redirected to Google login
6. Grant calendar permissions
7. The hackathon will be added to your Google Calendar with reminders:
   - 24 hours before event
   - 1 hour before event
   - 10 minutes before event

## Reminders Configuration

The calendar events are created with three automatic reminders:

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

You can customize these values in the `calendarService.js` file if needed.

## Troubleshooting

### "Google Calendar not configured"
- Make sure you've added GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local
- Restart the backend server after adding environment variables

### "Please connect your Google Calendar first"
- User hasn't authenticated yet
- Click "Connect Calendar" button to start OAuth flow

### "Calendar access token expired"
- User's token has expired
- User needs to reconnect by clicking "Connect Calendar" again
- System will automatically attempt token refresh

### Events not appearing in calendar
- Check if user granted calendar permissions
- Verify the hackathon start date is in the future
- Check browser console for error messages

## API Endpoints

### Get Auth URL
```
POST /api/calendar/auth-url
Headers: Authorization: Bearer {token}
Response: { success: true, authUrl: "https://..." }
```

### OAuth Callback
```
GET /api/calendar/callback?code={code}
Exchanges auth code for tokens and redirects to frontend
```

### Add Event to Calendar
```
POST /api/calendar/add-event
Headers: 
  - Authorization: Bearer {token}
  - Content-Type: application/json

Body: {
  "hackathonTitle": "GenAiVersity",
  "hackathonMode": "online",
  "startDateTime": "2026-01-25T14:07:00.000Z",
  "endDateTime": "2026-01-28T06:11:00.000Z",
  "organizerName": "CodeVerse",
  "venue": "Tech Hub, Delhi"
}

Response: {
  "success": true,
  "message": "Event added to Google Calendar successfully",
  "eventId": "...",
  "eventLink": "https://..."
}
```

### Check Calendar Status
```
GET /api/calendar/status
Headers: Authorization: Bearer {token}
Response: { success: true, connected: true, lastSync: "2026-01-25T..." }
```

### Disconnect Calendar
```
POST /api/calendar/disconnect
Headers: Authorization: Bearer {token}
Response: { success: true, message: "Google Calendar disconnected" }
```

## User Flow Diagram

```
Student Registers
    ↓
Registration Success Modal Opens
    ↓
"Add to Google Calendar?" Popup
    ├─ Skip for Now → Close modal
    └─ Connect Calendar → Start OAuth flow
         ↓
      Google Login
         ↓
      Grant Calendar Permissions
         ↓
      Backend exchanges code for tokens
         ↓
      Backend creates calendar event with:
      • Event title & description
      • Hackathon dates/times
      • 24hr, 1hr, 10min reminders
         ↓
      Event appears in Google Calendar
         ↓
      Show "Calendar Connected! 📅" success screen
         ↓
      Close modal and go to dashboard
```
