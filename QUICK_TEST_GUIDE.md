# Registration Authorization - Quick Start Testing Guide

## 🚀 One-Minute Setup

### Start Backend Server
```bash
cd backend
npm start
# Should see: Server running on port 5000
```

### Start Frontend Server
```bash
cd frontend/codeverse-campus
npm run dev
# Should see: Local: http://localhost:5173
```

---

## ✅ Test 1: Correct Organizer (SHOULD WORK)

### Step-by-Step

1. **Open Application**
   - Go to: `http://localhost:5173`

2. **Login as First Organizer (Organization)**
   - Email: `organizer1@example.com`
   - Password: `Test@1234`
   - Click "Login for Organizer"

3. **Create Hackathon** (If not already created)
   - Click "Create New Hackathon"
   - Fill all fields
   - **IMPORTANT:** Check "Publish" before saving
   - Click "Create"

4. **Verify from Student Side** (Different browser tab)
   - Open incognito/private window
   - Go to: `http://localhost:5173`
   - Login as student
   - Should see hackathon in available list
   - Click "Register"
   - Fill details and register

5. **View Registrations as Organizer**
   - Back to organizer tab
   - Click "My Hackathons"
   - Find the hackathon
   - Click "View Registrations"

### ✅ Expected Result
```
✅ See registration list
✅ Student name appears
✅ No error messages
✅ Shows count: "Total Registrations: 1"
✅ Browser console shows:
   ✅ [GET_REGISTRATIONS] Authorization successful
```

---

## ❌ Test 2: Wrong Organizer (SHOULD FAIL)

### Step-by-Step

1. **Setup Two Organizers**
   - Organizer A (created hackathon)
   - Organizer B (different organizer)

2. **Create Hackathon as Organizer A**
   - Login as Organizer A
   - Create and publish hackathon X
   - Note the hackathon ID from URL

3. **Try to Access as Organizer B**
   - Open new incognito window
   - Login as Organizer B
   - Manually go to: `http://localhost:5173/hackathon/{hackathon_X_id}/registrations`
   - (Replace {hackathon_X_id} with actual ID)

### ✅ Expected Result
```
❌ Shows error message:
   "Authorization Error: Not authorized to view these registrations
    Make sure you are logged in as the organizer who created 
    this hackathon."

✅ No registrations displayed
✅ Browser console shows:
   ❌ [GET_REGISTRATIONS] Authorization failed - organizer mismatch
   ❌ debug info with IDs
```

---

## 🔍 Test 3: Debug Console (ADVANCED)

### Access Browser Developer Tools
1. Press **F12** on keyboard
2. Go to **Console** tab
3. Copy-paste this script:

```javascript
// Quick Authorization Debug Test
console.log('🧪 TESTING AUTHORIZATION\n');

const token = localStorage.getItem('token');
if (!token) {
  console.log('❌ No token found!');
} else {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('✅ Token Found:');
    console.log('   User ID:', payload.id || payload.userId);
    console.log('   Email:', payload.email);
    console.log('   Role:', payload.role);
  } catch (e) {
    console.log('❌ Could not decode token');
  }
}

console.log('\n📋 Check Network Tab for API calls');
console.log('   Look for: GET /api/registrations/hackathon/...');
console.log('   Status should be: 200 (success) or 403 (forbidden)');
```

### Expected Console Output

**When authorized:**
```
✅ Token Found:
   User ID: 67abc123...
   Email: organizer@example.com
   Role: organizer
```

**When NOT authorized:**
```
❌ [GET_REGISTRATIONS] Authorization failed - organizer mismatch
debug info: {
  hackathonOrganizerId: "67xyz123...",
  requestUserId: "67abc456...",
  match: false
}
```

---

## 🔧 Database Verification (MONGODB)

### Check if Organizer ID is Stored Correctly

```javascript
// In MongoDB Atlas or MongoDB Compass

// Find your hackathon
db.hackathons.findOne(
  { title: "Your Hackathon Title" },
  { _id: 1, title: 1, organizer: 1 }
)

// Result should show:
// {
//   _id: ObjectId("..."),
//   title: "Your Hackathon Title",
//   organizer: ObjectId("67abc123...")  ← This is the organizer
// }

// Copy the organizer ID and verify in token
```

### Check if Student Registration Exists

```javascript
// Find registration for the hackathon
db.registrations.findOne(
  { hackathonId: ObjectId("...") },
  { _id: 1, hackathonId: 1, userId: 1, status: 1 }
)

// Result should show:
// {
//   _id: ObjectId("..."),
//   hackathonId: ObjectId("..."),  ← Same hackathon
//   userId: ObjectId("67jkl012..."), ← Different from organizer!
//   status: "registered"
// }
```

---

## 🐛 Troubleshooting

### Problem: Always Getting "Not Authorized"

**Check 1: Are you logged in as the right organizer?**
```javascript
// In console, check:
const token = localStorage.getItem('token')
const payload = JSON.parse(atob(token.split('.')[1]))
console.log('Your ID:', payload.id)
```

**Check 2: Is the database hackathon.organizer correct?**
```javascript
// In MongoDB:
db.hackathons.findOne({title: "..."})
// Check 'organizer' field matches token ID
```

**Check 3: Clear cache and reload**
```
Ctrl+Shift+Delete (Windows)
Cmd+Shift+Delete (Mac)
Clear all cache
```

### Problem: "Hackathon Not Found"

**Check 1: Verify hackathon exists in DB**
```javascript
db.hackathons.findOne({_id: ObjectId("...")})
```

**Check 2: Use correct hackathon ID in URL**
```
Should be: /hackathon/67abc123456789/registrations
Not: /hackathon/wrongid/registrations
```

### Problem: Student Not Seeing Registrations

**Check:** Make sure student actually registered
```javascript
// In MongoDB:
db.registrations.findOne({
  hackathonId: ObjectId("..."),
  userId: ObjectId("...") // student ID
})
```

### Problem: Token Invalid or Expired

**Solution:**
1. Logout completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Try again

---

## 📊 Network Debugging (F12 → Network Tab)

### What to Look For

**Successful Request:**
```
Request:
GET /api/registrations/hackathon/67def456...
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

Response Status: 200 OK
Response Body:
{
  "success": true,
  "count": 3,
  "registrations": [...]
}
```

**Failed Request:**
```
Request:
GET /api/registrations/hackathon/67def456...
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response Status: 403 Forbidden
Response Body:
{
  "success": false,
  "message": "Not authorized to view these registrations",
  "debug": {
    "hackathonOrganizerId": "67abc123...",
    "requestUserId": "67xyz789...",
    "match": false
  }
}
```

---

## 📋 Complete Test Checklist

```
SETUP
├─ [ ] Backend server running (port 5000)
├─ [ ] Frontend server running (port 5173)
├─ [ ] Database connection working
└─ [ ] Sample data/hackathons created

TEST 1: Correct Organizer
├─ [ ] Login as hackathon creator
├─ [ ] Navigate to View Registrations
├─ [ ] See registration list
├─ [ ] No error messages
├─ [ ] Console shows "Authorization successful"
└─ [ ] Status 200 in Network tab

TEST 2: Wrong Organizer
├─ [ ] Login as different organizer
├─ [ ] Try to view registrations
├─ [ ] See error message
├─ [ ] Debug info shows ID mismatch
├─ [ ] Console shows authorization failed
└─ [ ] Status 403 in Network tab

TEST 3: Student Registration
├─ [ ] Login as student
├─ [ ] Register for hackathon
├─ [ ] Registration saved successfully
├─ [ ] Back to organizer - new count visible
└─ [ ] Details match student's info

TEST 4: Authorization Logic
├─ [ ] Verified hackathon.organizer in DB
├─ [ ] Verified registration.userId in DB
├─ [ ] Verified token has correct user ID
├─ [ ] Compared values match when authorized
└─ [ ] Compared values don't match when unauthorized
```

---

## 🎯 Quick Summary

**What should happen:**

| Scenario | Result |
|----------|--------|
| Right organizer views registrations | ✅ Shows list (200) |
| Wrong organizer views registrations | ❌ Shows error (403) |
| Student tries to view | ❌ Shows error (middleware) |
| No token provided | ❌ Redirects to login |
| Token expired | ❌ Shows error |

---

## 📞 Support

If something doesn't work:

1. **Check console (F12)**
   - Look for error messages
   - Search for "Authorization"

2. **Check Network tab (F12 → Network)**
   - Look for failed requests
   - Check response status code

3. **Check backend logs**
   - Terminal should show request logs
   - Look for [GET_REGISTRATIONS] messages

4. **Check MongoDB**
   - Verify hackathon has correct organizer ID
   - Verify student has registered

5. **Look at documentation**
   - Read: ORGANIZER_REGISTRATION_AUTHORIZATION_FIX.md
   - Read: AUTHORIZATION_VISUAL_GUIDE.md

---

## 🚀 Ready to Test?

1. Make sure both servers are running
2. Start with **Test 1** (should pass)
3. Then try **Test 2** (should fail correctly)
4. Check all checkboxes ✅
5. Success! 🎉

---

**Status:** Ready for Testing  
**Date:** January 19, 2026  
**Last Updated:** January 19, 2026
