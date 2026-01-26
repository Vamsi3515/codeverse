# ⚡ Google Calendar Integration - Quick Start (5 minutes)

## TL;DR - What You Need to Do

### 1️⃣ Get Google Credentials (2 minutes)
Go to [Google Cloud Console](https://console.cloud.google.com) and:
- Create project "CodeVerse Campus"
- Enable Google Calendar API
- Create OAuth 2.0 credentials (Web app)
- Add redirect URI: `http://localhost:5000/api/calendar/callback`
- Copy Client ID and Client Secret

### 2️⃣ Add to `.env.local` (30 seconds)
```bash
# In backend/.env.local
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
BACKEND_URL=http://localhost:5000
```

### 3️⃣ Restart Backend (30 seconds)
```bash
cd backend
npm start
```

### 4️⃣ Test It! (2 minutes)
1. Open Student Dashboard
2. Register for any hackathon
3. Click "Connect Calendar" in success modal
4. Login with Google
5. Grant permissions
6. ✅ Event appears in your Google Calendar with reminders!

---

## What Happens Behind the Scenes

```
Registration Success
        ↓
Modal shows "Add to Google Calendar?"
        ↓
Click "Connect Calendar"
        ↓
Google OAuth popup opens
        ↓
User logs in + grants permissions
        ↓
Backend exchanges code for tokens
        ↓
Backend creates calendar event with:
  - Hackathon title
  - Start/end dates
  - Reminders: 24h, 1h, 10m before
        ↓
Modal shows "Calendar Connected! 📅"
        ↓
Close modal → Go to dashboard
        ↓
Student sees event in Google Calendar
```

---

## Features Included

✅ **OAuth Authentication** - Secure login with Google
✅ **Automatic Event Creation** - Event added to calendar instantly
✅ **3 Smart Reminders**:
   - 24 hours before (start preparing)
   - 1 hour before (wrap up and join)
   - 10 minutes before (final reminder)
✅ **Error Handling** - Shows friendly messages if something fails
✅ **Token Refresh** - Automatically refreshes expired tokens
✅ **Skip Option** - Users can skip calendar connection

---

## Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Google Calendar not configured" | Missing credentials in .env | Add GOOGLE_CLIENT_ID & SECRET |
| "Failed to get auth URL" | .env not reloaded | Restart backend (`npm start`) |
| Popup doesn't open | Browser blocked it | Allow popups for localhost |
| Event doesn't appear | User didn't grant permissions | Reconnect calendar and grant access |
| "Token expired" | Google token expired | Click "Connect Calendar" again |

---

## File Changes Made

### Frontend
- ✅ Enhanced `StudentDashboard.jsx` calendar functions
- ✅ Updated `RegistrationSuccessModal.jsx` UI
- ✅ Added better error handling

### Backend
- ✅ Used existing `calendarService.js`
- ✅ Used existing `calendarRoutes.js`
- ✅ Updated `.env.local` with Google credentials

### Database
- ✅ User model already has googleAccessToken & googleRefreshToken

---

## Customization Options

### Change Reminder Times
Edit `backend/src/services/calendarService.js` (around line 70):

```javascript
reminders: {
  overrides: [
    { method: 'notification', minutes: 48 * 60 }, // 2 days
    { method: 'notification', minutes: 24 * 60 }, // 1 day
    { method: 'notification', minutes: 30 }       // 30 mins
  ]
}
```

### Change Event Title Format
In same file (around line 55):

```javascript
// Current: "🔥 GenAiVersity"
summary: `🎯 ${hackathonTitle}`,  // Change emoji here
```

### Customize Event Description
Around line 60:

```javascript
description: `Hackathon: ${hackathonTitle}\n\nYour registration is confirmed...`
```

---

## Next: Production Deployment

When you go live with HTTPS:

1. **Update Google Console**:
   - Add redirect URI: `https://your-domain.com/api/calendar/callback`

2. **Update .env.local**:
   ```
   BACKEND_URL=https://your-domain.com
   GOOGLE_REDIRECT_URI=https://your-domain.com/api/calendar/callback
   FRONTEND_URL=https://your-domain.com
   ```

3. **Test thoroughly** before going live

---

## Support & Testing

For complete implementation details, see:
- `GOOGLE_CALENDAR_IMPLEMENTATION.md` - Full documentation
- `GOOGLE_CALENDAR_SETUP.md` - Detailed setup instructions

Have questions? Check the troubleshooting section in the main implementation guide!

---

**You're all set! 🎉 Your students can now add hackathons to their Google Calendar with automatic reminders!**
