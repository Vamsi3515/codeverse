# Quick Testing Guide - Offline Hackathon & QR Verification

## 🚀 Quick Start - Test in 5 Minutes

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- Organizer and Student accounts created

---

## 📝 Test Scenario 1: Create Offline Hackathon

### Step 1: Login as Organizer
```
1. Open http://localhost:5173/login/organizer
2. Enter credentials
3. Navigate to Dashboard
4. Click "+ Create Hackathon"
```

### Step 2: Fill Form
```
Title: "Tech Sprint 2026"
Description: "A hands-on coding challenge"
Mode: Select "Offline" 
```

### Step 3: Location Section Appears
```
- Venue Name: "Main Auditorium"
- Address: "123 Tech Street, Building A"
- City: "New Delhi"
- Click "📍 Get Location" button
  → Browser requests location permission
  → Accept permission
  → Latitude & Longitude auto-filled (e.g., 28.6139, 77.2090)
- Click "✅ Save Location"
```

### Step 4: Schedule
```
Start Date & Time: Select any future date/time
End Date & Time: Select date 2+ hours later
```

### Step 5: Publish
```
- Click "Publish Hackathon"
- Should see ✅ "Hackathon published successfully!"
- Redirect to dashboard
```

### Expected Result
✅ Hackathon created with offline location
✅ Location stored in database
✅ Visible in organizer dashboard

---

## 👨‍🎓 Test Scenario 2: Student Registration for Offline

### Step 1: Login as Student
```
1. Open http://localhost:5173/login/student
2. Enter credentials
3. Complete student profile (if needed)
```

### Step 2: Verify Email (if not done)
```
- Go to verify email page
- Enter OTP from email
- Complete verification
```

### Step 3: Upload Credentials
```
- Upload College ID Card
- Capture Live Selfie
- Save profile
```

### Step 4: Register for Offline Hackathon
```
1. Navigate to "Available Hackathons"
2. Find the offline hackathon just created
3. Click "Register"
4. System checks prerequisites:
   - Email verified ✅
   - ID card uploaded ✅
   - Live selfie captured ✅
5. Registration successful
```

### Step 5: View QR Code
```
1. Go to "My Hackathons"
2. Find registered offline hackathon
3. Click "View QR Code"
4. Modal appears with QR code
5. Can download QR or see token
```

### Expected Result
✅ Registration created only after all prerequisites met
✅ QR code generated with unique qrToken
✅ QR displayed in dashboard
✅ Can download as PNG

---

## 🔐 Test Scenario 3: QR Verification at Venue

### Step 1: Organizer Opens Scanner
```
1. Login as Organizer
2. Go to Dashboard
3. Find offline hackathon
4. Click "Scan QR" button (or similar)
```

### Step 2: Scanner Modal Opens
```
- Camera permission requested
- Accept camera permission
- Video stream shows (webcam)
- Frame overlay appears
```

### Step 3: Scan or Manual Entry
```
Option A - Scan:
- Point camera at QR code (from student)
- System detects QR

Option B - Manual:
- Click "📝 Enter Manually"
- Paste qrToken (from student dashboard)
- Submit
```

### Step 4: Verification Success
```
Modal shows:
- ✅ "Verified!" badge
- Student Name: "John Doe"
- Roll Number: "21B001"
- College: "XYZ University"
- Hackathon: "Tech Sprint 2026"
- Student Photo (selfie) displayed
- Green confirmation styling
```

### Step 5: Rescan or Close
```
- Click "Scan Next QR" to scan another student
- Or click "Close" to exit
```

### Expected Result
✅ QR verification successful
✅ Student details + photo displayed
✅ Registration marked as "attended"
✅ Organizer can continue scanning

---

## ❌ Test Scenario 4: Failure Cases

### Test 4A: Student Registration Fails Without Prerequisites
```
Requirement: All three needed
- Email verified ❌ → Registration fails
- ID card uploaded ❌ → Registration fails  
- Live selfie captured ❌ → Registration fails

Action: Try registering without one
Result: ❌ Registration rejected with error message
```

### Test 4B: QR Already Used
```
1. Student 1 registers and gets QR #1
2. Organizer scans QR #1 → Success ✅
3. Try scanning same QR #1 again
Result: ❌ "QR has already been used"
```

### Test 4C: Wrong Organizer Scans QR
```
1. Organizer A creates offline hackathon
2. Student registers, gets QR
3. Login as different Organizer B
4. Try to scan that QR
Result: ❌ "Not authorized to verify this hackathon QR"
```

### Test 4D: Invalid QR Token
```
1. Try scanning random/invalid QR
Result: ❌ "Invalid QR code"
```

---

## 🔍 Database Verification

### Check Hackathon Location
```bash
# In MongoDB:
db.hackathons.findOne({
  title: "Tech Sprint 2026",
  mode: "offline"
})

Expected output:
{
  location: {
    venueName: "Main Auditorium",
    address: "123 Tech Street, Building A",
    city: "New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    coordinates: {
      type: "Point",
      coordinates: [77.2090, 28.6139]
    }
  }
}
```

### Check Registration with QR
```bash
db.registrations.findOne({
  status: "registered"
})

Expected output:
{
  hackathonId: ObjectId("..."),
  userId: ObjectId("..."),
  qrToken: "uuid-string",
  qrIssuedAt: Date("2026-01-18T..."),
  qrUsed: false,
  emailVerified: true
}

After scan:
{
  qrUsed: true,
  qrUsedAt: Date("2026-01-18T..."),
  status: "attended"
}
```

---

## 🐛 Debugging Tips

### Issue: Location not filling with coordinates
```
Check:
1. Browser console for geolocation errors
2. HTTPS or localhost only (not HTTP over network)
3. Browser permissions: Settings → Privacy → Location
4. Try manual coordinate entry instead
```

### Issue: QR code not showing
```
Check:
1. qrToken is not null in registration
2. QR Server API is accessible (try URL in browser)
3. Check firewall/proxy blocking QR generation
4. Browser console for CORS errors
```

### Issue: Camera not working in modal
```
Check:
1. HTTPS connection required
2. Browser permissions: Settings → Privacy → Camera
3. Only one app can use camera (close other video apps)
4. Try different browser
```

### Issue: Backend /api/offline/verify-qr returns 404
```
Check:
1. Backend running on port 5000
2. Route registered in src/index.js:
   app.use('/api/offline', offlineRoutes);
3. Check src/routes/offlineRoutes.js exists
4. Verify token is being sent in Authorization header
```

---

## 📊 API Testing with cURL

### Create Hackathon (Offline)
```bash
curl -X POST http://localhost:5000/api/hackathons \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Sprint",
    "description": "Coding challenge",
    "mode": "offline",
    "college": "XYZ University",
    "startDate": "2026-02-01T10:00:00Z",
    "endDate": "2026-02-01T14:00:00Z",
    "registrationStartDate": "2026-01-20T00:00:00Z",
    "registrationEndDate": "2026-01-31T23:59:59Z",
    "duration": 4,
    "maxParticipants": 100,
    "location": {
      "venueName": "Main Hall",
      "address": "123 Street",
      "city": "New Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "publish": true
  }'
```

### Register for Hackathon
```bash
curl -X POST http://localhost:5000/api/registrations \
  -H "Authorization: Bearer <STUDENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "hackathonId": "<HACKATHON_ID>"
  }'
```

### Verify QR Code
```bash
curl -X POST http://localhost:5000/api/offline/verify-qr \
  -H "Authorization: Bearer <ORGANIZER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "uuid-string-here"
  }'
```

---

## ✅ Final Verification Checklist

After completing all test scenarios:

- [ ] Offline hackathon created with location
- [ ] Location fields populated correctly
- [ ] Geolocation button auto-fills coordinates
- [ ] Student registration requires email + ID + selfie
- [ ] QR code generated and displayed
- [ ] Organizer can scan QR
- [ ] Student details + photo shown on verification
- [ ] QR cannot be reused
- [ ] Wrong organizer cannot verify QR
- [ ] Database shows location data
- [ ] Registration status updated to "attended" after scan
- [ ] All error cases handled gracefully

---

## 🎯 Performance Considerations

- Geolocation API call: ~1-3 seconds
- QR generation: Instant (client-side via API)
- Camera initialization: ~500ms - 1s
- Backend QR verification: ~200-300ms
- Database location indexing: Geospatial index for proximity queries

---

**Last Updated:** January 18, 2026
**Difficulty Level:** Beginner-friendly ✅
