# 🧪 QUICK TEST GUIDE - Organizer Flow

## ✅ BEFORE TESTING

### 1. Ensure Backend is Running
```bash
cd backend
node src/index.js
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

### 2. Check Account Status
```bash
cd backend
node check-all-accounts.js
```

**Expected Result:**
```
📋 STUDENT COLLECTION:
✅ Found: NALLAKANTAM SUREKHA
   Email Verified: true
   
🔍 SUMMARY:
⚠️  Student account exists (exception email) - can login via organizer login
```

---

## 🎯 TEST 1: ORGANIZER LOGIN

### Via Frontend:
1. Go to: http://localhost:5173/login/organizer
2. Enter credentials:
   - Email: `22b61a0557@sitam.co.in`
   - Password: `[your_password]`
3. Click "Login"

### Expected Result:
- ✅ Login successful
- ✅ Redirected to organizer dashboard
- ✅ No "User not found" error

### Backend Console Logs:
```
🔍 Organizer login attempt for: 22b61a0557@sitam.co.in
❌ Organizer not found in organizers collection
✅ Found in student collection
✅ Organizer found: 22b61a0557@sitam.co.in ID: ...
✅ Password verified successfully
✅ Login successful for: 22b61a0557@sitam.co.in Token generated, Account Type: student
```

---

## 🎯 TEST 2: DASHBOARD LOADS

### After Login:
1. Dashboard should load automatically
2. Should see sections:
   - 📅 Scheduled Hackathons
   - 🔥 Active Hackathons
   - 📊 Previous Hackathons

### Expected Result:
- ✅ Dashboard loads without errors
- ✅ No "User not found" message
- ✅ Can see "Create Hackathon" button

### Backend Console Logs:
```
✅ Organizer found in middleware: 22b61a0557@sitam.co.in ID: ...
✅ Exception email detected - granting organizer role
🔍 Fetching hackathons for organizer ID: ...
✅ Hackathons found: X (Total: X)
```

---

## 🎯 TEST 3: CREATE HACKATHON

### Steps:
1. Click "Create Hackathon" button
2. Fill in form:
   - Title: `Test Hackathon ${Date.now()}`
   - Description: `Test description`
   - College: `SITAM`
   - Mode: `Online`
   - Start Date: Future date
   - End Date: Future date (after start)
   - Duration: `24`
   - Max Participants: `100`
   - Participation Type: `Team`
   - Team Size: `3`
3. Toggle "Publish Now" = ON
4. Click "Create"

### Expected Result:
- ✅ Hackathon created successfully
- ✅ Redirected to dashboard
- ✅ New hackathon appears in "Scheduled Hackathons"

### Backend Console Logs:
```
✅ Organizer found in middleware: 22b61a0557@sitam.co.in
🔍 Creating hackathon for organizer ID: ...
🔍 Organizer email: 22b61a0557@sitam.co.in Role: organizer
✅ Hackathon saved: ... Title: Test Hackathon ... Status: scheduled
✅ Organizer ID in hackathon: ...
```

---

## 🎯 TEST 4: SCHEDULED HACKATHONS DISPLAY

### Steps:
1. After creating hackathon, refresh dashboard
2. Look at "Scheduled Hackathons" section

### Expected Result:
- ✅ Newly created hackathon appears
- ✅ Shows title, date, participants count
- ✅ Shows "Online/Offline/Hybrid" badge
- ✅ No "No scheduled hackathons" message

### Backend Console Logs:
```
🔍 Fetching hackathons for organizer ID: ...
✅ Hackathons found: 1 (Total: 1)
✅ First hackathon: Test Hackathon ... Status: scheduled
```

---

## 🎯 TEST 5: DATA PERSISTENCE

### Steps:
1. Close browser tab
2. Open new tab
3. Go to: http://localhost:5173/login/organizer
4. Login again with same credentials
5. Check dashboard

### Expected Result:
- ✅ All previously created hackathons still visible
- ✅ Data persists across sessions
- ✅ No data loss

---

## 🔧 TROUBLESHOOTING

### Issue: "User not found"
**Solution:**
- Check if backend server is running
- Verify MongoDB connection
- Check backend console for error logs

### Issue: "Invalid credentials"
**Solution:**
- Verify password is correct
- Check if student account exists: `node check-all-accounts.js`
- Ensure email is verified

### Issue: Hackathons not appearing
**Solution:**
- Check backend console logs
- Verify token is being sent in Authorization header
- Check if hackathon was created with correct organizerId
- Run: `node test-organizer-flow.js`

### Issue: "Not authorized"
**Solution:**
- Check if token is expired
- Login again to get fresh token
- Verify middleware is setting req.user.role = 'organizer'

---

## 📊 DIAGNOSTIC SCRIPTS

### Check All Accounts:
```bash
node check-all-accounts.js
```
Shows which collections have the email

### Check Student Verification:
```bash
node check-student-verification.js
```
Shows verification status and login eligibility

### Test Login Flow:
```bash
node test-organizer-flow.js
```
Tests login and hackathon fetch (update password in script)

---

## ✅ SUCCESS CRITERIA

All tests pass if:
1. ✅ Login works without "User not found" error
2. ✅ Dashboard loads correctly
3. ✅ Can create hackathon
4. ✅ Hackathon appears in "Scheduled Hackathons"
5. ✅ Data persists after refresh
6. ✅ Backend logs show correct flow

---

## 📞 NEXT STEPS

After testing:
1. Create multiple hackathons to test pagination
2. Test updating hackathon status
3. Test deleting hackathons
4. Test with different organizer roles (HOD, Faculty, etc.)
5. Test student coordinator flow if applicable

---

**Happy Testing! 🚀**
