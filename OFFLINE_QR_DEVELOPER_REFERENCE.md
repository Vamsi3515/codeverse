# 🚀 Developer Quick Reference - Offline Hackathon & QR Verification

## At a Glance

**What:** Offline hackathon location capture + QR-based student verification  
**Where:** Backend & Frontend of CodeVerse Campus  
**Status:** ✅ Production Ready  
**Key Files:** See file structure below

---

## 📁 File Structure

### Backend Files (Modified/Created)

```
backend/src/
├── models/
│   ├── Hackathon.js          ✏️  MODIFIED - location schema
│   └── Registration.js       ✏️  MODIFIED - QR fields added
├── controllers/
│   ├── hackathonController.js ✏️  MODIFIED - location validation
│   └── registrationController.js ✏️  MODIFIED + verifyOfflineQr function
├── routes/
│   └── offlineRoutes.js      ✨  NEW - POST /api/offline/verify-qr
└── index.js                  ✏️  MODIFIED - registered offline routes
```

### Frontend Files (Modified/Created)

```
frontend/codeverse-campus/src/
├── pages/
│   └── CreateHackathon.jsx   ✏️  MODIFIED - integrated OfflineLocationPicker
├── components/
│   ├── OfflineLocationPicker.jsx  ✨  NEW - geolocation + location form
│   ├── QRCodeDisplay.jsx          ✨  NEW - QR code rendering
│   └── QRScannerModal.jsx         ✨  NEW - camera + verification
└── App.jsx                   (No changes needed - imports already handle these)
```

---

## 🔑 Key Concepts

### 1. Offline Location
```javascript
// Storage
hackathon.location = {
  venueName: "Main Hall",
  address: "123 Street, Building A",
  city: "New Delhi",
  latitude: 28.6139,
  longitude: 77.2090
}

// Validation: All 5 fields required for offline mode
// Geolocation: Lat/Lng auto-filled from browser API
```

### 2. QR Token
```javascript
// Generation
qrToken = UUID v4 (unique per student + hackathon)

// Payload (encoded in QR)
{
  studentId,
  hackathonId,
  registrationId,
  qrToken,
  timestamp
}

// One-time use: qrUsed flag prevents reuse
```

### 3. Registration Prerequisites (Offline Only)
```javascript
Before registration accepted:
✓ emailVerified = true
✓ collegeIdCard uploaded (URL exists)
✓ liveSelfie uploaded (URL exists)

If any missing → Registration rejected
```

---

## 🔀 Data Flow (Simplified)

### Create Offline Hackathon
```
Organizer Form
    ↓ (OfflineLocationPicker component)
Location Object {venueName, address, city, latitude, longitude}
    ↓
POST /api/hackathons (with location)
    ↓
Backend: validateOfflineLocation()
    ↓
Store with coordinates: {type: "Point", coordinates: [lng, lat]}
    ↓
✅ Hackathon Created
```

### Register for Offline Hackathon
```
Student Click "Register"
    ↓
Backend: Check email/ID/selfie
    ↓
All present? → Create registration + Generate UUID qrToken
    ↓
Return qrToken to frontend
    ↓
Frontend: QRCodeDisplay renders QR image
    ↓
✅ Student Registered with QR
```

### Verify QR at Venue
```
Organizer Click "Scan QR"
    ↓
QRScannerModal: Camera or Manual Entry
    ↓
Send qrToken to POST /api/offline/verify-qr
    ↓
Backend: Check ownership + qrUsed flag
    ↓
Return student data {name, college, roll, photo}
    ↓
Update: qrUsed = true, status = "attended"
    ↓
✅ Student Verified
```

---

## 🔌 API Quick Reference

### POST /api/hackathons (Create Offline)
```javascript
HEADERS: Authorization: Bearer <token>

BODY: {
  mode: "offline",
  location: {
    venueName: String,
    address: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  // ... other fields
}

VALIDATION: All location fields required for offline mode

RESPONSE: {
  success: true,
  hackathon: { _id, title, location, ... }
}
```

### POST /api/registrations (Register Offline)
```javascript
HEADERS: Authorization: Bearer <token>

BODY: {
  hackathonId: ObjectId
}

PREREQUISITE CHECKS:
- emailVerified: true ✓
- collegeIdCard: uploaded ✓
- liveSelfie: uploaded ✓

RESPONSE (Offline): {
  success: true,
  registration: { _id, qrToken, ... },
  qrPayload: { studentId, hackathonId, registrationId, qrToken }
}
```

### POST /api/offline/verify-qr (NEW)
```javascript
HEADERS: Authorization: Bearer <token>

BODY: {
  qrToken: "uuid-string"
}

AUTHORIZATION: Organizer must be hackathon owner

SECURITY CHECKS:
- Verify QR belongs to organizer's hackathon
- Verify QR not already used (qrUsed === false)
- Find student profile
- Return student details

RESPONSE (Success): {
  success: true,
  data: {
    studentName: String,
    college: String,
    rollNumber: String,
    registeredHackathon: String,
    selfieImageUrl: String,
    verificationStatus: "VALID"
  }
}

RESPONSE (Error): {
  success: false,
  message: "Invalid QR code" | "QR already used" | "Not authorized"
}
```

---

## 🛠️ Component API

### OfflineLocationPicker
```jsx
<OfflineLocationPicker
  onLocationSelect={(locationObj) => {
    // locationObj = { venueName, address, city, latitude, longitude }
  }}
  existingLocation={currentLocation}  // For editing
/>
```

### QRCodeDisplay
```jsx
<QRCodeDisplay
  studentId="..."
  hackathonId="..."
  registrationId="..."
  qrToken="uuid-string"
/>
```

### QRScannerModal
```jsx
{showScanner && (
  <QRScannerModal
    hackathonId="..."
    hackathonTitle="..."
    onClose={() => setShowScanner(false)}
    onVerify={(studentData) => {
      console.log(studentData)  // {studentName, college, roll, photo, ...}
    }}
  />
)}
```

---

## ⚡ Quick Start for Developers

### To Add QR Scanning to Organizer Dashboard

```jsx
// 1. Import components
import QRScannerModal from '../components/QRScannerModal'

// 2. Add state
const [showScanner, setShowScanner] = useState(false)
const [verifiedStudent, setVerifiedStudent] = useState(null)

// 3. Add button
<button onClick={() => setShowScanner(true)}>
  📱 Scan QR Code
</button>

// 4. Add modal
{showScanner && (
  <QRScannerModal
    hackathonId={hackathonId}
    hackathonTitle={hackathonTitle}
    onClose={() => setShowScanner(false)}
    onVerify={(data) => {
      setVerifiedStudent(data)
      // Handle verified student (entry allowed, etc.)
    }}
  />
)}

// 5. Display verification result
{verifiedStudent && (
  <StudentVerificationCard student={verifiedStudent} />
)}
```

### To Add QR Display to Student Dashboard

```jsx
// 1. Import component
import QRCodeDisplay from '../components/QRCodeDisplay'

// 2. Get registration with qrToken (from API)
const registration = await fetchRegistration(hackathonId)

// 3. Render QR
<QRCodeDisplay
  studentId={userId}
  hackathonId={hackathonId}
  registrationId={registration._id}
  qrToken={registration.qrToken}
/>
```

---

## 🔍 Testing Commands

### Test Location Validation
```bash
# Should fail - no location
curl -X POST http://localhost:5000/api/hackathons \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "offline",
    "title": "Test"
    // missing location
  }'
# Response: 400 "Location is required for offline..."
```

### Test QR Verification
```bash
# Should succeed
curl -X POST http://localhost:5000/api/offline/verify-qr \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "actual-uuid-from-db"
  }'
# Response: 200 with student details

# Should fail on reuse
curl -X POST http://localhost:5000/api/offline/verify-qr \
  -H "Authorization: Bearer ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "same-uuid"
  }'
# Response: 400 "QR has already been used"
```

---

## 🐛 Common Debug Points

### Location Not Saving
```javascript
// Check in hackathonController.js
const normalizeLocation = (location) => {
  if (!location) return null;
  return {
    ...location,
    coordinates: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude]
    }
  };
};
```

### QR Not Generating
```javascript
// Check in QRCodeDisplay.jsx
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}`
// Ensure qrToken exists and data is properly stringified
```

### Verification Failing
```javascript
// Check in registrationController.js verifyOfflineQr()
// 1. Find registration by qrToken
// 2. Check qrUsed flag
// 3. Check organizer authorization
// 4. Find student profile (try both Student and User models)
```

---

## 📊 Database Queries

### Find Offline Hackathon
```javascript
db.hackathons.findOne({
  mode: "offline",
  "location.venueName": { $exists: true }
})
```

### Find Registration with QR
```javascript
db.registrations.findOne({
  qrToken: "uuid-here"
})
```

### Check Used QRs
```javascript
db.registrations.find({
  qrUsed: true,
  qrUsedAt: { $exists: true }
})
```

---

## 📝 Code Snippets

### Validate Location (Backend)
```javascript
const validateOfflineLocation = (mode, location) => {
  if (mode !== 'offline' && mode !== 'hybrid') return null;
  if (!location) return 'Location is required';
  const { venueName, address, city, latitude, longitude } = location;
  if (!venueName || !address || !city || latitude === undefined || longitude === undefined) {
    return 'All location fields required';
  }
  return null;
};
```

### Generate QR Token (Backend)
```javascript
const { v4: uuidv4 } = require('uuid');

const qrToken = hackathon.mode === 'offline' ? uuidv4() : undefined;

registration.qrToken = qrToken;
registration.qrIssuedAt = new Date();
```

### Verify QR (Backend)
```javascript
const registration = await Registration.findOne({ qrToken });
if (registration.qrUsed) {
  return res.status(400).json({ success: false, message: 'QR already used' });
}
registration.qrUsed = true;
registration.qrUsedAt = new Date();
registration.status = 'attended';
await registration.save();
```

---

## ✅ Deployment Checklist

- [ ] Backend UUID package installed: `npm ls uuid`
- [ ] MongoDB geospatial index created
- [ ] offlineRoutes.js registered in index.js
- [ ] Frontend components imported correctly
- [ ] QR Server API accessible from frontend
- [ ] Geolocation API works (HTTPS or localhost only)
- [ ] Camera permissions tested
- [ ] All error messages display correctly
- [ ] Database migrations run (if any)
- [ ] Environment variables set
- [ ] CORS configured for new endpoints

---

## 🚀 Performance Tips

1. **Cache QR images** - Generated once, reuse URL
2. **Lazy load QR code** - Only render when modal opens
3. **Batch QR verification** - Store multiple tokens to reduce DB calls
4. **Index optimization** - Geospatial index on location.coordinates
5. **Pagination** - If scanning many students, paginate results

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|---|---|
| QR not displaying | Check qrToken is not null, verify QR Server API is accessible |
| Location not filling | Ensure HTTPS or localhost, check browser geolocation permissions |
| Camera not working | Use HTTPS, check camera permissions, try different browser |
| Verification fails | Check organizer authorization, verify qrToken exists, check qrUsed flag |
| Registration fails offline | Check email verified, ID card, selfie uploaded |

---

**Last Updated:** January 18, 2026  
**Maintained By:** Development Team  
**Version:** 1.0 - Production Ready ✅

