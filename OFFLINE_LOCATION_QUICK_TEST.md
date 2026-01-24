# 🧪 OFFLINE HACKATHON LOCATION FEATURE - QUICK TEST GUIDE

## 🚀 QUICK START

### 1. Start Backend
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
cd frontend/codeverse-campus
npm run dev
```

---

## 📋 STEP-BY-STEP TESTING

### Test 1: Student Registration with College Address

1. **Open Frontend**: http://localhost:5173
2. **Go to Student Registration**
3. **Fill Registration Form:**
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@sitam.ac.in
   - Password: Test@123
   - Phone: 1234567890
   - College: SITAM Engineering College
   - **College Address: SITAM, Visakhapatnam, Andhra Pradesh**
   - Branch: Computer Science
   - Semester: 5

4. **Submit Registration**
5. **Verify OTP** (check email or console logs)

6. **Check Database:**
```bash
# MongoDB Shell
use codeverse-campus
db.students.findOne({ email: "john.doe@sitam.ac.in" }, { college: 1, collegeAddress: 1, collegeLat: 1, collegeLng: 1 })
```

**Expected Result:**
- `collegeAddress`: "SITAM, Visakhapatnam, Andhra Pradesh"
- `collegeLat`: ~17.68 (latitude)
- `collegeLng`: ~83.21 (longitude)

---

### Test 2: Organizer Creates Offline Hackathon

1. **Login as Organizer**
2. **Create New Hackathon:**
   - Title: AI-ML Winter Hackathon
   - Mode: **Offline**
   - Venue Name: Tech Convention Center
   - Address: Dwaraka Nagar, Visakhapatnam, AP
   - City: Visakhapatnam
   - Latitude: 17.7300
   - Longitude: 83.3100
   - (Fill other required fields)

3. **Publish Hackathon**

---

### Test 3: Test Location APIs

#### Test Hackathon Location API:
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/hackathons/<HACKATHON_ID>/location" -Method Get
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "venueName": "Tech Convention Center",
    "venueAddress": "Dwaraka Nagar, Visakhapatnam, AP",
    "city": "Visakhapatnam",
    "venueLat": 17.73,
    "venueLng": 83.31
  }
}
```

#### Test Student College Location API:
```bash
# PowerShell (with auth token)
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:5000/api/students/<USER_ID>/college-location" -Method Get -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "college": "SITAM Engineering College",
    "collegeAddress": "SITAM, Visakhapatnam, Andhra Pradesh",
    "collegeLat": 17.68,
    "collegeLng": 83.21
  }
}
```

---

### Test 4: Student Dashboard - Get Location & Distance

1. **Login as Student** (john.doe@sitam.ac.in)
2. **Go to Dashboard**
3. **Find Offline Hackathon** (AI-ML Winter Hackathon)
4. **Click "Get Location & Distance" Button**

**Expected Behavior:**
1. Alert appears showing:
   - "Distance from your college to hackathon venue: X.X km"
   - "Opening Google Maps..."

2. Google Maps opens in new tab showing:
   - Route from college (SITAM) to venue (Dwaraka Nagar)
   - Driving directions
   - Estimated time

**Distance Calculation:**
- SITAM (17.68, 83.21) → Dwaraka Nagar (17.73, 83.31)
- Expected Distance: ~9-12 km (straight line)

---

## 🔍 ERROR HANDLING TESTS

### Test 5: Student Without College Address

1. **Create student without collegeAddress**
2. **Try to get distance**
3. **Expected Error:**
   - "College location not available. Please update your profile with college address."

---

### Test 6: Online Hackathon (No Location)

1. **Create Online Hackathon**
2. **Student tries to get location**
3. **Expected:**
   - "Get Location & Distance" button should NOT appear
   - Or show error: "Location is only available for offline/hybrid hackathons"

---

### Test 7: Unauthorized Access

1. **Try to access another student's college location without auth**
2. **Expected Error:**
   - 403: "Not authorized to access this resource"

---

## 🐛 DEBUGGING

### Check Backend Logs:
Look for these console logs:
```
✅ Geocoded college address: SITAM, Visakhapatnam -> (17.68, 83.21)
```

### Check Frontend Console:
```javascript
console.log('Hackathon Location:', { venueLat, venueLng });
console.log('College Location:', { collegeLat, collegeLng });
console.log('Distance:', distance, 'km');
```

### MongoDB Queries:
```javascript
// Check student college location
db.students.find({ collegeLat: { $exists: true } }).pretty()

// Check hackathon venue location
db.hackathons.find({ 
  mode: "offline", 
  "location.latitude": { $exists: true } 
}).pretty()
```

---

## ✅ SUCCESS CRITERIA

- [x] Student registration saves college address and geocodes it
- [x] Hackathon location API returns venue coordinates
- [x] Student location API returns college coordinates
- [x] Distance calculation works (Haversine formula)
- [x] Google Maps opens with correct route
- [x] Error handling for missing data
- [x] Authorization works correctly

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: Geocoding Fails
**Symptom:** collegeLat and collegeLng are null
**Fix:** 
- Check internet connection
- Use more specific address (include city/state)
- Add Google Maps API key to .env (optional)

### Issue 2: "College location not available"
**Symptom:** API returns 404
**Solution:**
- Student needs to provide collegeAddress during registration
- Or update profile with college address

### Issue 3: Google Maps Doesn't Open
**Symptom:** No new tab opens
**Fix:**
- Check browser popup blocker
- Check console for JavaScript errors
- Verify lat/lng values are numbers

### Issue 4: Wrong Distance
**Symptom:** Distance seems incorrect
**Debug:**
```javascript
console.log('College:', collegeLat, collegeLng);
console.log('Venue:', venueLat, venueLng);
```
- Verify coordinates are correct
- Remember: Haversine gives straight-line distance, not road distance

---

## 📞 SUPPORT

If issues persist:
1. Check browser console for errors
2. Check backend logs for errors
3. Verify MongoDB collections have correct data
4. Test APIs directly with Postman/curl

---

**Happy Testing! 🎉**
