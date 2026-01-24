# 🔐 Secure Student Registration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STUDENT REGISTRATION FLOW                         │
│                  (All Steps Are Mandatory)                           │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│ STEP 1: Student Fills Basic Information                              │
├───────────────────────────────────────────────────────────────────────┤
│ • Full Name                                                           │
│ • College Name                                                        │
│ • College Email                                                       │
│ • Phone Number                                                        │
│ • Password                                                            │
└───────────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 2: Email OTP Verification                                       │
├───────────────────────────────────────────────────────────────────────┤
│ Frontend:                                                             │
│   1. Click "Send OTP" → POST /api/otp/send-email-otp                │
│                                                                       │
│ Backend:                                                              │
│   2. Check if email already exists                                   │
│   3. Generate 6-digit OTP                                            │
│   4. Store in MongoDB (expires in 5 min)                            │
│   5. Send OTP via email                                              │
│                                                                       │
│ Frontend:                                                             │
│   6. Student enters OTP                                              │
│   7. Click "Verify" → POST /api/otp/verify-email-otp               │
│                                                                       │
│ Backend:                                                              │
│   8. Check OTP validity (not expired, max 3 attempts)               │
│   9. Mark as verified                                                │
│                                                                       │
│ ✅ Email field disabled, shows green checkmark                       │
└───────────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 3: Mobile OTP Verification                                      │
├───────────────────────────────────────────────────────────────────────┤
│ Frontend:                                                             │
│   1. Click "Send OTP" → POST /api/otp/send-mobile-otp               │
│                                                                       │
│ Backend:                                                              │
│   2. Check if phone already exists                                   │
│   3. Generate 6-digit OTP                                            │
│   4. Store in MongoDB (expires in 5 min)                            │
│   5. Send OTP via SMS (console log in demo mode)                    │
│                                                                       │
│ Frontend:                                                             │
│   6. Student enters OTP                                              │
│   7. Click "Verify" → POST /api/otp/verify-mobile-otp              │
│                                                                       │
│ Backend:                                                              │
│   8. Check OTP validity (not expired, max 3 attempts)               │
│   9. Mark as verified                                                │
│                                                                       │
│ ✅ Phone field disabled, shows green checkmark                       │
└───────────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 4: Camera Verification (MANDATORY)                              │
├───────────────────────────────────────────────────────────────────────┤
│ Frontend:                                                             │
│   1. Click "Open Camera"                                             │
│   2. Browser requests camera permission                              │
│   3. Student allows camera access                                    │
│   4. Camera feed appears in preview                                  │
│   5. Click "Capture Selfie"                                          │
│   6. Image captured and displayed                                    │
│                                                                       │
│ ✅ Selfie shows green checkmark                                      │
│                                                                       │
│ ⚠️  If camera permission denied → Registration FAILS                 │
└───────────────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────────────┐
│ STEP 5: Final Registration                                           │
├───────────────────────────────────────────────────────────────────────┤
│ Frontend:                                                             │
│   • Checks all verifications complete                                │
│   • Checklist shows all items crossed out (green)                   │
│   • Click "Register" → POST /api/otp/register-student               │
│                                                                       │
│ Backend Security Checks:                                             │
│   ✅ Verify email OTP was verified                                   │
│   ✅ Verify mobile OTP was verified                                  │
│   ✅ Verify camera verification = true                               │
│   ✅ Check all required fields                                       │
│   ✅ Check email/phone not already registered                        │
│                                                                       │
│ If ANY check fails → Registration DENIED                             │
│                                                                       │
│ If ALL checks pass:                                                  │
│   1. Hash password with bcrypt                                       │
│   2. Create user in MongoDB:                                         │
│      - emailVerified: true                                           │
│      - mobileVerified: true                                          │
│      - cameraVerified: true                                          │
│      - isVerified: true                                              │
│   3. Clear OTP records from database                                │
│   4. Return success message                                          │
│                                                                       │
│ Frontend:                                                             │
│   • Show success alert                                               │
│   • Redirect to login page                                           │
└───────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

                         SECURITY FEATURES

═══════════════════════════════════════════════════════════════════════

🔒 Password Security:
   • Never stored in plain text
   • Hashed with bcrypt (salt rounds: 10)
   • Minimum 6 characters required

📧 Email OTP Security:
   • 6-digit random code
   • Expires in 5 minutes
   • Maximum 3 verification attempts
   • Auto-deleted after verification
   • Unique email check before sending

📱 Mobile OTP Security:
   • 6-digit random code
   • Expires in 5 minutes
   • Maximum 3 verification attempts
   • Auto-deleted after verification
   • Unique phone check before sending

📷 Camera Security:
   • Browser camera permission required
   • Selfie image mandatory
   • Cannot proceed without capture
   • Stored in localStorage for QR verification

🗃️ Database Security:
   • MongoDB TTL index (auto-expire OTPs)
   • Unique constraints on email/phone
   • Verification flags enforced
   • Only fully verified users in database

═══════════════════════════════════════════════════════════════════════

                         FAILURE SCENARIOS

═══════════════════════════════════════════════════════════════════════

❌ Registration will FAIL if:

1. Email OTP not verified
   → "Email verification required. Please verify your email first."

2. Mobile OTP not verified
   → "Mobile verification required. Please verify your phone number first."

3. Camera not verified (no selfie)
   → "Camera verification is mandatory. Please capture your selfie."

4. Email already registered
   → "Email already registered"

5. Phone already registered
   → "Phone number already registered"

6. OTP expired (> 5 minutes)
   → "OTP expired. Please request a new one."

7. Wrong OTP (3 times)
   → "Too many failed attempts. Please request a new OTP."

8. Required fields missing
   → "Please provide all required fields"

═══════════════════════════════════════════════════════════════════════

                         SUCCESS CRITERIA

═══════════════════════════════════════════════════════════════════════

✅ Registration SUCCEEDS only when:

   [✓] Email OTP verified
   [✓] Mobile OTP verified
   [✓] Camera selfie captured
   [✓] All required fields filled
   [✓] Email not already used
   [✓] Phone not already used
   [✓] Password matches confirmation
   [✓] Password hashed successfully
   [✓] User created in MongoDB with all verification flags = true

═══════════════════════════════════════════════════════════════════════

                         MONGODB COLLECTIONS

═══════════════════════════════════════════════════════════════════════

1️⃣  users Collection (Permanent):

{
  "_id": ObjectId("..."),
  "firstName": "John",
  "lastName": "Doe",
  "email": "student@college.edu",
  "phone": "+919876543210",
  "password": "$2a$10$...",        // Hashed with bcrypt
  "college": "University Name",
  "role": "student",
  "emailVerified": true,            // ✅ New field
  "mobileVerified": true,           // ✅ New field
  "cameraVerified": true,           // ✅ New field
  "isVerified": true,
  "createdAt": "2025-12-30T...",
  "updatedAt": "2025-12-30T..."
}

2️⃣  otpverifications Collection (Temporary - Auto-delete):

{
  "_id": ObjectId("..."),
  "identifier": "student@college.edu",  // email or phone
  "otp": "123456",
  "type": "email",                      // or "mobile"
  "verified": false,
  "attempts": 0,
  "expiresAt": "2025-12-30T12:35:00Z",  // TTL index
  "createdAt": "2025-12-30T12:30:00Z"
}

Note: TTL index automatically deletes expired records

═══════════════════════════════════════════════════════════════════════

                         API ENDPOINTS SUMMARY

═══════════════════════════════════════════════════════════════════════

POST /api/otp/send-email-otp
├─ Body: { email }
└─ Response: { success, message }

POST /api/otp/verify-email-otp
├─ Body: { email, otp }
└─ Response: { success, message }

POST /api/otp/send-mobile-otp
├─ Body: { phone }
└─ Response: { success, message }

POST /api/otp/verify-mobile-otp
├─ Body: { phone, otp }
└─ Response: { success, message }

POST /api/otp/register-student
├─ Body: { firstName, lastName, email, password, phone, college, 
│          cameraVerified, ... }
├─ Security: Checks all verifications before proceeding
└─ Response: { success, message, user }

═══════════════════════════════════════════════════════════════════════

                         IMPLEMENTATION STATUS

═══════════════════════════════════════════════════════════════════════

Backend:
  ✅ OTPVerification model created
  ✅ OTP service (generate/verify/clear)
  ✅ SMS service (demo mode)
  ✅ OTP controller (all endpoints)
  ✅ OTP routes mounted
  ✅ User model updated (verification fields)
  ✅ Email service integrated
  ✅ Security checks implemented

Frontend:
  ✅ Email OTP UI with verify button
  ✅ Mobile OTP UI with verify button
  ✅ Camera verification UI
  ✅ Loading states on all buttons
  ✅ Verification status indicators (✅)
  ✅ Requirements checklist
  ✅ Disabled fields after verification
  ✅ Error handling
  ✅ Success redirect to login

═══════════════════════════════════════════════════════════════════════

Ready for testing! 🚀
Backend: http://localhost:5000
Frontend: http://localhost:5173
