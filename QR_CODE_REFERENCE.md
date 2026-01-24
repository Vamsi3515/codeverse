# 🔑 QR CODE IMPLEMENTATION - CODE REFERENCE

Quick reference for all key code changes made for QR code verification system.

---

## 1️⃣ Backend: QR Code Generation Function

**File**: `backend/src/controllers/registrationController.js`

```javascript
// Generate QR code for offline hackathon registration
const generateQRCode = async (registrationId, hackathonId, studentName, rollNumber, collegeName, hackathonTitle) => {
  try {
    const qrData = {
      registrationId: registrationId.toString(),
      hackathonId: hackathonId.toString(),
      studentName,
      rollNumber,
      collegeName,
      hackathonTitle,
      generatedAt: new Date().toISOString()
    };

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    console.log('✅ [QR CODE] Generated QR code for registration:', registrationId);
    return qrCodeDataUrl;
  } catch (err) {
    console.error('❌ [QR CODE] Error generating QR code:', err);
    return null;
  }
};
```

---

## 2️⃣ Backend: Register Function with QR Generation

**File**: `backend/src/controllers/registrationController.js`

```javascript
// In registerForHackathon() - after registration.save()
const registration = new Registration(registrationData);
await registration.save();

// Generate QR code for offline hackathons
if (hackathon.mode === 'offline' && registration.qrToken) {
  console.log('🔷 [QR CODE] Generating QR code for offline hackathon registration...');
  
  const qrCodeImage = await generateQRCode(
    registration._id,
    hackathon._id,
    studentName,
    studentProfile.regNumber || '',
    studentProfile.college || '',
    hackathon.title
  );

  if (qrCodeImage) {
    registration.qrCode = qrCodeImage; // Store base64 QR code image
    await registration.save();
    console.log('✅ [QR CODE] QR code generated and saved successfully');
  } else {
    console.warn('⚠️ [QR CODE] Failed to generate QR code, but registration completed');
  }
}
```

---

## 3️⃣ Backend: Database Schema Update

**File**: `backend/src/models/Registration.js`

```javascript
qrCode: {
  type: String, // Base64 encoded PNG image data URL
  default: null,
},
```

**Location**: Between `qrToken` and `qrIssuedAt` fields in schema

---

## 4️⃣ Backend: Verification Endpoint Route

**File**: `backend/src/routes/registrationRoutes.js`

```javascript
// QR verification (Organizer)
router.post('/verify-qr', protect, authorize('organizer', 'admin'), registrationController.verifyOfflineQr);
```

---

## 5️⃣ Backend: Package.json Dependencies

**File**: `backend/package.json`

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    // ... other dependencies
  }
}
```

---

## 6️⃣ Frontend: QRCodeDisplay Component Signature

**File**: `frontend/codeverse-campus/src/components/QRCodeDisplay.jsx`

```javascript
import React from 'react'

export default function QRCodeDisplay({ hackathon, registration, onClose }) {
  // Component receives:
  // - hackathon: { title, startDate, endDate, ... }
  // - registration: { 
  //     studentName, rollNumber, qrCode (base64), registrationDate, ... 
  //   }
  // - onClose: callback to close modal
}
```

---

## 7️⃣ Frontend: Download QR Function

**File**: `frontend/codeverse-campus/src/components/QRCodeDisplay.jsx`

```javascript
const handleDownload = () => {
  if (!registration.qrCode) return

  // Convert data URL to blob and download
  const link = document.createElement('a')
  link.href = registration.qrCode
  link.download = `${registration.studentName}-${hackathon.title}-QR.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

---

## 8️⃣ Frontend: Print QR Function

**File**: `frontend/codeverse-campus/src/components/QRCodeDisplay.jsx`

```javascript
const handlePrint = () => {
  const printWindow = window.open('', '', 'height=500,width=500')
  printWindow.document.write(`
    <html>
      <head>
        <title>QR Code - ${registration.studentName}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: white;
          }
          .qr-container {
            text-align: center;
          }
          .qr-image {
            margin: 20px 0;
            border: 2px solid #333;
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <h1>${registration.studentName}</h1>
          <p>${hackathon.title}</p>
          <img src="${registration.qrCode}" alt="QR Code" class="qr-image" />
          <p style="margin-top: 30px; font-weight: bold;">
            Show this QR code at the hackathon venue
          </p>
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  setTimeout(() => printWindow.print(), 250)
}
```

---

## 9️⃣ Frontend: StudentDashboard Integration

**File**: `frontend/codeverse-campus/src/pages/StudentDashboard.jsx`

```javascript
import QRCodeDisplay from '../components/QRCodeDisplay'

// In state initialization:
const [qrDisplayModal, setQrDisplayModal] = useState({ 
  open: false, 
  hackathon: null, 
  registration: null 
})

// Updated handleRegistrationSuccess function:
function handleRegistrationSuccess(registration) {
  console.log('✅ [REGISTRATION SUCCESS] Registration data received:', registration);
  
  const hackathonId = registration.hackathonId
  setRegisteredHackathons(prev => {
    const next = [...prev, hackathonId]
    try{ localStorage.setItem('registeredHackathons', JSON.stringify(next)) }catch(e){}
    return next
  })

  // Find the hackathon from allHackathons
  const hackathon = allHackathons.find(h => h.id === hackathonId || h._id === hackathonId)
  
  // Show QR code modal for offline hackathons
  if (hackathon && (hackathon.mode === 'Offline' || hackathon.mode === 'offline')) {
    console.log('🎟️ [QR DISPLAY] Showing QR code modal for offline hackathon:', hackathon.title);
    setQrDisplayModal({ 
      open: true, 
      hackathon, 
      registration: {
        ...registration,
        registrationDate: new Date().toISOString()
      }
    })
  } else {
    console.log('ℹ️ [REGISTRATION] Online hackathon - no QR code needed');
    alert('You have successfully registered for this hackathon!')
  }
}

// In JSX return section:
{qrDisplayModal.open && qrDisplayModal.hackathon && qrDisplayModal.registration && (
  <QRCodeDisplay
    hackathon={qrDisplayModal.hackathon}
    registration={qrDisplayModal.registration}
    onClose={() => setQrDisplayModal({ open: false, hackathon: null, registration: null })}
  />
)}
```

---

## 🔟 Frontend: QRScannerModal Endpoint Update

**File**: `frontend/codeverse-campus/src/components/QRScannerModal.jsx`

```javascript
// In verifyQR function:
const response = await fetch('http://localhost:5000/api/registrations/verify-qr', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ qrToken }),
})
```

---

## 📊 API Request/Response Examples

### **Registration Request** (with offline hackathon)
```bash
POST /api/registrations
Authorization: Bearer {token}
Content-Type: application/json

{
  "hackathonId": "673a1f2c3d4e5f6g7h8i9j0k",
  "teamData": null  // or team object for team-based
}
```

### **Registration Response**
```json
{
  "success": true,
  "message": "Registration successful",
  "registration": {
    "_id": "507f1f77bcf86cd799439011",
    "hackathonId": "673a1f2c3d4e5f6g7h8i9j0k",
    "userId": "507f1f77bcf86cd799439012",
    "studentName": "John Doe",
    "rollNumber": "20CS001",
    "status": "registered",
    "qrToken": "550e8400-e29b-41d4-a716-446655440000",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAASwA...",
    "qrIssuedAt": "2024-01-15T10:30:00.000Z",
    "qrUsed": false,
    "registrationDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### **Verify QR Request**
```bash
POST /api/registrations/verify-qr
Authorization: Bearer {organizer_token}
Content-Type: application/json

{
  "qrToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Verify QR Response** (Success)
```json
{
  "success": true,
  "data": {
    "studentName": "John Doe",
    "college": "AITAM Tekkali",
    "rollNumber": "20CS001",
    "registeredHackathon": "Campus CodeSprint",
    "selfieImageUrl": "https://res.cloudinary.com/..../image.jpg",
    "verificationStatus": "VALID"
  }
}
```

### **Verify QR Response** (Error - Already Used)
```json
{
  "success": false,
  "message": "QR has already been used"
}
```

---

## 🔐 Security Implementation

### **Import Statements** (Already in place)
```javascript
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');  // NEW
```

### **Authorization Middleware** (Active)
```javascript
router.post('/verify-qr', protect, authorize('organizer', 'admin'), registrationController.verifyOfflineQr);
```

### **Double-Use Prevention** (In verifyOfflineQr)
```javascript
if (registration.qrUsed) {
  return res.status(400).json({ success: false, message: 'QR has already been used' });
}

registration.qrUsed = true;
registration.qrUsedAt = new Date();
registration.status = 'attended';
await registration.save();
```

---

## 🧪 Testing Examples

### **Test Registration** (cURL)
```bash
curl -X POST http://localhost:5000/api/registrations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "hackathonId": "673a1f2c3d4e5f6g7h8i9j0k",
    "teamData": null
  }'
```

### **Test Verification** (cURL)
```bash
curl -X POST http://localhost:5000/api/registrations/verify-qr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### **Check Database**
```javascript
// MongoDB
db.registrations.findOne({
  _id: ObjectId("507f1f77bcf86cd799439011")
})

// Expected output:
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  qrToken: "550e8400-e29b-41d4-a716-446655440000",
  qrCode: "data:image/png;base64,iVBORw0K...",
  qrUsed: true,
  qrUsedAt: ISODate("2024-01-15T10:45:00.000Z"),
  status: "attended"
}
```

---

## 📝 Console Logging Reference

### **Frontend Logs**
```javascript
// After successful registration
✅ [REGISTRATION SUCCESS] Registration data received: {...}
🎟️ [QR DISPLAY] Showing QR code modal for offline hackathon: Campus CodeSprint

// Online hackathon
ℹ️ [REGISTRATION] Online hackathon - no QR code needed
```

### **Backend Logs**
```javascript
// QR Generation
🔷 [QR CODE] Generating QR code for offline hackathon registration...
✅ [QR CODE] QR code generated and saved successfully
✅ [QR CODE] Generated QR code for registration: 507f1f77bcf86cd799439011

// QR Verification
✅ [VERIFICATION] QR code verified successfully
✅ [VERIFICATION] Registration marked as attended
```

---

## 🔗 Environment Variables (If Needed)

```bash
# .env file
MONGODB_URI=mongodb://localhost:27017/hackathon
JWT_SECRET=your-secret-key
QR_CODE_SIZE=300  # Optional: Default 300x300
QR_ERROR_CORRECTION=H  # Optional: H, M, L, Q
```

---

## 📚 Files Quick Access

| File | Purpose | Key Function |
|------|---------|--------------|
| `registrationController.js` | Backend logic | `generateQRCode()`, `registerForHackathon()`, `verifyOfflineQr()` |
| `Registration.js` | Database schema | `qrCode` field definition |
| `registrationRoutes.js` | API routes | `/verify-qr` endpoint |
| `QRCodeDisplay.jsx` | Frontend modal | Display QR + download/print |
| `StudentDashboard.jsx` | Integration | Show QR after registration |
| `QRScannerModal.jsx` | Organizer tool | Scan and verify QR |
| `package.json` | Dependencies | `qrcode@1.5.3` |

---

## ✨ Key Constants & Values

```javascript
// QR Code Settings
QR_SIZE: 300  // pixels
QR_MARGIN: 1  // modules
QR_ERROR_CORRECTION: 'H'  // High (30% recovery)
QR_TYPE: 'image/png'
QR_COLOR_DARK: '#000000'  // Black
QR_COLOR_LIGHT: '#FFFFFF'  // White

// Timestamps
qrIssuedAt: new Date()  // When QR was generated
qrUsedAt: new Date()  // When QR was scanned
generatedAt: new Date().toISOString()  // In QR data

// Status Values
status: 'registered'  // Before attendance
status: 'attended'  // After QR verification

// Flags
qrUsed: false  // Initial
qrUsed: true  // After scanning
```

---

## 🎓 Troubleshooting Code

### **QR Not Generating?**
```javascript
// Check in browser console:
console.log('Registration:', registration)
console.log('Has qrCode?', registration.qrCode ? 'YES' : 'NO')

// Check backend logs for:
// "❌ [QR CODE] Error generating QR code:" 
```

### **QR Image Not Showing?**
```javascript
// Verify data URL format:
const qrCode = registration.qrCode
if (!qrCode.startsWith('data:image/png;base64,')) {
  console.error('Invalid QR code format')
}

// Try rendering:
<img src={registration.qrCode} alt="QR" />
```

### **Verification Failed?**
```javascript
// Check token exists:
const { qrToken } = registration
console.log('QR Token:', qrToken)

// Check registration not already used:
db.registrations.findOne({ qrToken, qrUsed: false })
```

---

**Reference Document**: QR Code Implementation Code Reference  
**Status**: ✅ Complete and Ready  
**Last Updated**: [Current Date]
