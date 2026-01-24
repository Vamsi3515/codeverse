# 🧪 QR CODE VERIFICATION - QUICK TEST GUIDE

## Prerequisites
- Backend running: `npm run dev` (from backend folder)
- Frontend built: `npm run build` (from frontend/codeverse-campus)
- MongoDB connected
- Valid student and organizer accounts

---

## 🎯 Test Scenario 1: Student Registration with QR

### Step 1: Login as Student
```
URL: http://localhost:3000
Email: student@example.com
Password: password123
```

### Step 2: Find Offline Hackathon
- Look for hackathons with `Mode: Offline`
- Example: "Campus CodeSprint", "Fullstack Forge", etc.

### Step 3: Click Register
- Click "Register" button on offline hackathon card
- Team Registration Modal opens

### Step 4: Complete Registration
- If solo: Just click Register
- If team: Enter team name + member details
- Click "Register" to submit

### Expected Result ✓
- Modal shows: "Registration Confirmed! ✓"
- Registration details display
- **QR code image appears** (backend-generated)
- Student name, roll number, date shown
- Download and Print buttons available

### Test Download
1. Click "📥 Download QR" button
2. Browser downloads file: `StudentName-HackathonTitle-QR.png`
3. Verify file is PNG with QR code visible

### Test Print
1. Click "🖨️ Print" button
2. Print preview opens with QR centered
3. Verify QR is large and printable

---

## 🎯 Test Scenario 2: QR Code Content Verification

### Decode the QR
1. Download the QR code (from Test Scenario 1)
2. Use online QR decoder: `https://qrserver.com/qr-decode/`
3. Upload downloaded PNG file

### Expected QR Data Structure
```json
{
  "registrationId": "ObjectId",
  "hackathonId": "ObjectId",
  "studentName": "John Doe",
  "rollNumber": "20CS001",
  "collegeName": "AITAM Tekkali",
  "hackathonTitle": "Campus CodeSprint",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

✓ Verify all fields are correctly encoded

---

## 🎯 Test Scenario 3: Organizer QR Scanning

### Step 1: Login as Organizer
```
URL: http://localhost:3000
Email: organizer@example.com
Password: password123
```

### Step 2: Access Hackathon Dashboard
- Go to "My Hackathons" or organizer dashboard
- Select an offline hackathon with registrations
- Look for "Scan Attendee QR" or similar button

### Step 3: Open QR Scanner
- Click scanner button
- QRScannerModal opens
- Camera permission requested

### Allow Camera Permission
- Browser asks for camera access
- Click "Allow"
- Video feed should appear in modal

### Step 4: Scan QR Code
**Option A: Physical QR**
- Print the QR from Test Scenario 1
- Hold QR in front of camera
- Scanner should detect automatically

**Option B: Digital QR**
- Open QR image on second device/screen
- Point camera at QR image

**Option C: Manual Entry**
1. Click "📝 Enter Manually" button
2. Prompt appears for QR Token
3. Open browser DevTools → Application → localStorage
4. Find registration token and copy
5. Paste in prompt

### Expected Result ✓
- Modal shows: "✅ Verified!"
- Student details displayed:
  - Student Name
  - Roll Number
  - College
  - Registered Hackathon
- Student selfie displayed
- Message: "✓ Student allowed entry"

---

## 🎯 Test Scenario 4: Double-Scan Prevention

### Step 1: Scan First Time
- Use QR from Test Scenario 3
- Verification succeeds
- Shows "Verified!" with student details

### Step 2: Scan Same QR Again
- Click "Scan Next QR"
- Scanner reopens
- Scan the same QR code again

### Expected Result ✓
- Error message appears:
  ```
  ❌ QR has already been used
  ```
- Verification fails as expected
- Prevents duplicate attendance marking

---

## 🎯 Test Scenario 5: Backend Verification

### Check Database
```javascript
// In MongoDB or Mongo Compass
db.registrations.findOne({ qrUsed: false })
// Before scanning

db.registrations.findOne({ _id: ObjectId("...") })
// After scanning, should show:
{
  ...
  qrUsed: true,
  qrUsedAt: ISODate("2024-01-15T10:45:00Z"),
  status: "attended"
}
```

### Check Logs
**Backend Logs Should Show:**
```
🔷 [QR CODE] Generating QR code for offline hackathon registration...
✅ [QR CODE] QR code generated and saved successfully
```

**During Verification:**
```
✅ [VERIFICATION] QR code verified successfully
✅ [VERIFICATION] Registration marked as attended
```

---

## 🧮 Manual API Testing

### Generate QR (via Registration)
```bash
curl -X POST http://localhost:5000/api/registrations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "hackathonId": "hexId",
    "teamData": null
  }'

# Response includes:
# {
#   "registration": {
#     "_id": "...",
#     "qrToken": "uuid-string",
#     "qrCode": "data:image/png;base64,iVBORw0K...",
#     ...
#   }
# }
```

### Verify QR Endpoint
```bash
curl -X POST http://localhost:5000/api/registrations/verify-qr \
  -H "Authorization: Bearer {organizer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "uuid-string-from-registration"
  }'

# Response (Success):
# {
#   "success": true,
#   "data": {
#     "studentName": "John Doe",
#     "college": "AITAM Tekkali",
#     "rollNumber": "20CS001",
#     "registeredHackathon": "Campus CodeSprint",
#     "selfieImageUrl": "https://cloudinary.com/image.jpg",
#     "verificationStatus": "VALID"
#   }
# }
```

---

## ✅ Verification Checklist

### Frontend
- [ ] QRCodeDisplay modal shows after offline hackathon registration
- [ ] QR code image displays in modal
- [ ] Download button works and saves PNG file
- [ ] Print button opens print dialog
- [ ] QR data contains all 6 required fields
- [ ] QRScannerModal opens and requests camera permission
- [ ] Scanner detects QR code
- [ ] Manual entry option works
- [ ] Verification success shows student details
- [ ] Student selfie displays
- [ ] "Scan Next QR" button works

### Backend
- [ ] qrcode package installed (check: `npm list qrcode`)
- [ ] QR code generated as base64 PNG after registration
- [ ] QR code stored in `registration.qrCode` field
- [ ] QR token created as UUID for offline hackathons
- [ ] `/api/registrations/verify-qr` endpoint accessible
- [ ] Organizer authorization enforced
- [ ] Double-scan prevention works (qrUsed flag)
- [ ] Registration marked as `attended` after verification
- [ ] qrUsedAt timestamp recorded
- [ ] Debug logs show QR generation and verification

### Database
- [ ] Registration has qrCode field populated
- [ ] Registration has qrToken (UUID)
- [ ] Registration has qrUsed boolean
- [ ] Registration has qrIssuedAt timestamp
- [ ] Registration has qrUsedAt timestamp
- [ ] Status changes to "attended" after scan

---

## 🐛 Troubleshooting

### QR Code Not Showing
**Check:**
1. Backend logs show "✅ [QR CODE] QR code generated..."
2. Response includes qrCode field with base64 data
3. Frontend receives qrCode in registration object
4. Try refreshing page and registering again

**Fix:**
```javascript
// In QRCodeDisplay.jsx, verify:
console.log('QR Code:', registration.qrCode)
// Should show: data:image/png;base64,iVBORw0K...
```

### Scanner Not Detecting QR
**Check:**
1. Camera permission granted in browser
2. QR image is clear and well-lit
3. QR is fully visible in frame
4. Try manual entry instead

**Fix:**
- Click "📝 Enter Manually" button
- Copy qrToken from database
- Paste to verify endpoint works

### Verification Failing
**Check:**
1. Correct organizer logged in
2. QR token is valid and unscanned
3. Hackathon exists and is offline/hybrid
4. Check backend logs for error

**Fix:**
```javascript
// Get fresh registration from database
db.registrations.findOne(
  { _id: ObjectId("..."), qrUsed: false }
)
// Copy qrToken and test manually
```

### QRScannerModal Not Opening
**Check:**
1. User is organizer (check token and user role)
2. Offline hackathon selected
3. Check browser console for errors
4. Verify QRScannerModal imported in component

**Fix:**
```bash
# Rebuild frontend
npm run build
# Restart dev server
```

---

## 📊 Expected Test Results

| Test | Expected | Status |
|------|----------|--------|
| Register offline hackathon | QR modal shows with image | ✅ |
| QR image quality | PNG, 300x300px, readable | ✅ |
| Download QR | Saves as PNG file | ✅ |
| Print QR | Print preview with QR centered | ✅ |
| QR content | Valid JSON with 6 fields | ✅ |
| Scan valid QR | Shows student details + selfie | ✅ |
| Scan twice | Second scan fails with error | ✅ |
| Database state | qrUsed=true, status=attended | ✅ |
| Organizer auth | Non-organizer cannot scan | ✅ |
| Offline only | Online hackathon has no QR | ✅ |

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] Backend logs are clean (no errors)
- [ ] Frontend build has no errors or warnings
- [ ] Database verified for corrupt entries
- [ ] Rate limiting enabled on verify-qr endpoint
- [ ] Error messages don't expose sensitive data
- [ ] QR codes tested on multiple browsers
- [ ] Camera permission flow tested on mobile
- [ ] Selfie images load correctly
- [ ] Print functionality tested on different printers
- [ ] Manual entry tested with copied tokens
- [ ] Load tested with multiple simultaneous scans

---

**Document**: QR Code Quick Test Guide  
**Last Updated**: [Current Date]  
**Status**: Ready for Testing  
**Build**: Frontend ✅ | Backend ✅ | Database ✅
