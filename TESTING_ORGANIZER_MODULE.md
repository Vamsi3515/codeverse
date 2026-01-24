# Quick Testing Guide - Organizer Hackathon Module

## 🧪 Step-by-Step Testing

### Prerequisites
- MongoDB running on localhost:27017
- Backend server running on port 5000
- Frontend running on port 5173
- At least one organizer account registered

---

## Test 1: Create Your First Hackathon

### Step 1: Login as Organizer
1. Navigate to: `http://localhost:5173/login/organizer`
2. Login with organizer credentials
3. Should redirect to: `/dashboard/organizer`

### Step 2: Navigate to Create Hackathon
1. Click "**+ Create Hackathon**" button in dashboard
2. Should navigate to: `/create-hackathon`

### Step 3: Fill the Form
```
Title: "AI Innovation Challenge"
Description: "Build innovative AI-powered solutions"
Mode: "Online"
Participation Type: "Team"
Registration Fee: 0
Start Date & Time: [Tomorrow at 10:00 AM]
End Date & Time: [Tomorrow at 10:00 PM]
Rules: "1. Original code only\n2. Team collaboration allowed\n3. Submit before deadline"

Anti-Cheating Options:
☑️ Allow Tab Switching
☑️ Allow Copy-Paste
☐ Require Full Screen
```

### Step 4: Publish
1. Click "**Publish Hackathon**"
2. Wait for success message
3. Should auto-redirect to dashboard

### Step 5: Verify Dashboard
1. Check "**Scheduled Hackathons**" section
2. Your new hackathon should appear there
3. Verify details: title, type (Online), date

---

## Test 2: Create Offline Hackathon

### Fill Form with Offline Mode:
```
Title: "Campus Coding Marathon"
Description: "24-hour offline hackathon on campus"
Mode: "Offline"
Location: "Main Auditorium, Building A"
Participation Type: "Solo"
Registration Fee: 100
Start Date & Time: [Next week]
End Date & Time: [Next week + 24 hours]
```

### Verify:
- Location field appears when mode = offline
- Hackathon appears in dashboard after creation

---

## Test 3: Status Categorization

### Create 3 Hackathons with Different Dates:

**Past Event (Should appear in "Completed"):**
```
Title: "Past Hackathon"
Start: [Yesterday]
End: [Yesterday + 12 hours]
```

**Current Event (Should appear in "Active"):**
```
Title: "Ongoing Hackathon"
Start: [1 hour ago]
End: [Tomorrow]
```

**Future Event (Should appear in "Scheduled"):**
```
Title: "Upcoming Hackathon"
Start: [Next week]
End: [Next week + 24 hours]
```

### Verify Dashboard:
- "Completed Hackathons" section shows past event
- "Active Hackathons" section shows ongoing event
- "Scheduled Hackathons" section shows future event

---

## Test 4: Data Persistence

### Step 1: Create a Hackathon
1. Create any hackathon
2. Verify it appears in dashboard

### Step 2: Refresh Browser
1. Press F5 or refresh page
2. Dashboard should reload
3. Hackathon should still be there (loaded from DB)

### Step 3: Logout and Login Again
1. Logout from organizer account
2. Login again
3. Navigate to dashboard
4. All your hackathons should still be visible

---

## Test 5: Multiple Organizers

### Setup:
- Create 2 organizer accounts
- Login as Organizer A
- Create 2 hackathons

### Test:
1. Logout from Organizer A
2. Login as Organizer B
3. Dashboard should be **empty** (no hackathons)
4. Create 1 hackathon as Organizer B
5. Only this 1 hackathon should appear
6. Logout and login back as Organizer A
7. Should see only the 2 hackathons created by Organizer A

**Expected:** Each organizer sees only their own hackathons

---

## Test 6: Validation

### Test Required Fields:
1. Try to publish without filling title → Should show error
2. Try to publish without description → Should show error
3. Try to publish without dates → Should show error
4. Select "Offline" mode without location → Should show error

### Test Optional Fields:
1. Leave rules empty → Should work (default rules applied)
2. Set registration fee to 0 → Should work (free event)
3. Uncheck all anti-cheat options → Should work

---

## Test 7: API Testing with cURL

### Create Hackathon:
```bash
curl -X POST http://localhost:5000/api/hackathons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Hackathon",
    "description": "Testing API",
    "college": "Test College",
    "mode": "online",
    "startDate": "2026-02-01T10:00:00",
    "endDate": "2026-02-02T10:00:00",
    "registrationStartDate": "2026-01-15T00:00:00",
    "registrationEndDate": "2026-01-31T23:59:59",
    "duration": 24,
    "maxParticipants": 100,
    "registrationFee": 0,
    "participationType": "team",
    "publish": true
  }'
```

### Get Organizer Hackathons:
```bash
curl http://localhost:5000/api/hackathons/organizer/my-hackathons \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Test 8: MongoDB Verification

### Check Database:
```javascript
// In MongoDB shell or Compass
use hackathon_management

// View all hackathons
db.hackathons.find().pretty()

// Find hackathons by specific organizer
db.hackathons.find({ organizer: ObjectId("ORGANIZER_ID") }).pretty()

// Check status field
db.hackathons.find({}, { title: 1, status: 1, startDate: 1 })
```

---

## ✅ Success Criteria Checklist

- [ ] Organizer can create hackathon via form
- [ ] Form validates all required fields
- [ ] Success message appears after creation
- [ ] Redirects to dashboard automatically
- [ ] New hackathon appears in dashboard immediately
- [ ] Hackathon stored in MongoDB with correct organizerId
- [ ] Dashboard categorizes by scheduled/active/completed
- [ ] Different organizers see only their own hackathons
- [ ] Data persists after page refresh
- [ ] Offline mode shows location field
- [ ] Anti-cheat options are saved correctly
- [ ] No console errors during flow

---

## 🐛 Common Issues & Solutions

### Issue 1: "Please login to create a hackathon"
**Solution:** Ensure you're logged in and token is in localStorage
```javascript
// Check in browser console
console.log(localStorage.getItem('token'))
```

### Issue 2: Hackathon not appearing in dashboard
**Solution:** 
1. Check backend console for errors
2. Verify API response in Network tab
3. Check MongoDB for hackathon entry
4. Ensure organizerId matches logged-in user

### Issue 3: "Failed to create hackathon"
**Solution:**
1. Check backend logs
2. Verify MongoDB is running
3. Check all required fields are filled
4. Verify token is valid

### Issue 4: Wrong status categorization
**Solution:**
1. Check system clock is correct
2. Verify date formats are correct
3. Check timezone settings

---

## 📊 Expected Data Flow

```
1. User fills form
   ↓
2. Form validation (frontend)
   ↓
3. POST /api/hackathons { publish: true }
   ↓
4. Backend validates + saves to MongoDB
   ↓
5. Returns: { success: true, hackathon: {...} }
   ↓
6. Success message + redirect
   ↓
7. Dashboard loads: GET /api/hackathons/organizer/my-hackathons
   ↓
8. Frontend categorizes by dates
   ↓
9. Displays in appropriate section
```

---

## 🎯 Testing Complete When:

✅ All 8 tests pass  
✅ No console errors  
✅ Data persists correctly  
✅ Multiple organizers work independently  
✅ Status categorization is accurate  
✅ Form validation works properly  
✅ API responses are correct  
✅ MongoDB data is structured correctly  

---

**Happy Testing! 🚀**
