# Fixed OTP Flow - API Testing Guide

## ✅ Issue Fixed: E11000 Duplicate Key Error

### **Problem:**
- OTP flow was creating user records prematurely
- `collegeIdCardHash` and `selfieHash` with null values caused duplicate key errors
- Users were created before email verification

### **Solution:**
- ✅ Separate OTP collection (no user creation during OTP send)
- ✅ Fixed sparse unique indexes (use `undefined` instead of `null`)
- ✅ Three-step registration: Send OTP → Verify OTP → Create User

---

## 🔄 NEW REGISTRATION FLOW

### **Step 1: Send OTP**
```
POST /api/auth/send-otp
```

**Request Body:**
```json
{
  "email": "student@college.edu",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email. Please verify within 10 minutes.",
  "email": "student@college.edu"
}
```

**What Happens:**
- ✅ Validates college email (blocks public domains)
- ✅ Checks if email already registered
- ✅ Generates 6-digit OTP
- ✅ Saves OTP in `otpverifications` collection (NOT users)
- ✅ Sends OTP via email
- ❌ Does NOT create user record yet

---

### **Step 2: Verify OTP**
```
POST /api/auth/verify-otp
```

**Request Body:**
```json
{
  "email": "student@college.edu",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now complete your registration.",
  "email": "student@college.edu",
  "verified": true
}
```

**Response (Incorrect OTP):**
```json
{
  "success": false,
  "message": "Incorrect OTP. 4 attempts remaining."
}
```

**What Happens:**
- ✅ Finds OTP record in database
- ✅ Checks if OTP is expired (10-minute validity)
- ✅ Verifies OTP matches
- ✅ Tracks incorrect attempts (max 5)
- ✅ Marks OTP as verified
- ❌ Does NOT create user yet

---

### **Step 3: Complete Registration**
```
POST /api/auth/complete-registration
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "student@college.edu",
  "password": "securePassword123",
  "phone": "+1234567890",
  "college": "Tech University",
  "branch": "Computer Science",
  "semester": 5,
  "regNumber": "CS2021001",
  "collegeIdCard": "base64_or_url",
  "collegeIdCardHash": "hash123...",
  "liveSelfie": "base64_or_url",
  "selfieHash": "hash456..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "student@college.edu",
    "phone": "+1234567890",
    "college": "Tech University",
    "role": "student",
    "isEmailVerified": true
  }
}
```

**What Happens:**
- ✅ Verifies OTP was completed (checked in database)
- ✅ Checks OTP verification is recent (within 30 minutes)
- ✅ Validates duplicate credentials (regNumber, ID hash, selfie hash)
- ✅ Creates user with `isEmailVerified: true`
- ✅ Deletes OTP record from database
- ✅ Returns JWT token for immediate login

---

## 🧪 TESTING WITH cURL

### Test 1: Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@techuniversity.edu",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected:** OTP sent to email, saved in `otpverifications` collection

---

### Test 2: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@techuniversity.edu",
    "otp": "123456"
  }'
```

**Expected:** OTP verified, marked as verified in database

---

### Test 3: Complete Registration
```bash
curl -X POST http://localhost:5000/api/auth/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@techuniversity.edu",
    "password": "SecurePass123",
    "phone": "+1234567890",
    "college": "Tech University",
    "branch": "CS",
    "semester": 5,
    "regNumber": "CS2021001"
  }'
```

**Expected:** User created with email verified, JWT token returned

---

## 🔍 MongoDB Verification

### Check OTP Collection:
```javascript
use hackathon_management

// View OTP records
db.otpverifications.find().pretty()

// Check specific email
db.otpverifications.find({ identifier: "student@college.edu" }).pretty()
```

**Sample OTP Record:**
```json
{
  "_id": "...",
  "identifier": "student@college.edu",
  "otp": "123456",
  "type": "email",
  "expiresAt": "2026-01-09T12:30:00Z",
  "verified": false,
  "attempts": 0,
  "createdAt": "2026-01-09T12:20:00Z"
}
```

### Check Users Collection:
```javascript
// Should be EMPTY until Step 3 (complete-registration) is called
db.users.find({ email: "student@college.edu" }).pretty()

// After Step 3, user should exist with verified email
db.users.find({ email: "student@college.edu" }, {
  firstName: 1,
  email: 1,
  isEmailVerified: 1,
  collegeIdCardHash: 1,
  selfieHash: 1
}).pretty()
```

---

## ⚠️ Error Scenarios & Solutions

### Error 1: Public Email Domain
**Request:**
```json
{
  "email": "john@gmail.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Please use your college/university email address. Public email domains (gmail.com, yahoo.com, etc.) are not allowed.",
  "isPublicEmail": true
}
```

---

### Error 2: Email Already Registered
**Response:**
```json
{
  "success": false,
  "message": "Email already registered. Please login instead."
}
```

---

### Error 3: OTP Expired
**Response:**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new OTP."
}
```

**Solution:** Call `/api/auth/send-otp` again

---

### Error 4: Too Many Incorrect Attempts
**Response:**
```json
{
  "success": false,
  "message": "Too many incorrect attempts. Please request a new OTP."
}
```

**Solution:** Call `/api/auth/send-otp` to get a fresh OTP

---

### Error 5: OTP Not Verified
**Scenario:** Trying to complete registration without verifying OTP

**Response:**
```json
{
  "success": false,
  "message": "Email not verified. Please verify your email with OTP first."
}
```

**Solution:** Call `/api/auth/verify-otp` first

---

### Error 6: Duplicate Credentials
**Response:**
```json
{
  "success": false,
  "message": "This college ID card is already registered with another account",
  "isDuplicate": true,
  "duplicateField": "collegeIdCardHash"
}
```

**Solution:** Check if user already registered or use different credentials

---

## 🔧 Fixing Existing Database Issues

### Remove Duplicate Null Values:
```javascript
// If you have existing users with null hashes causing issues
db.users.updateMany(
  { collegeIdCardHash: null },
  { $unset: { collegeIdCardHash: "" } }
)

db.users.updateMany(
  { selfieHash: null },
  { $unset: { selfieHash: "" } }
)
```

### Drop Old Indexes (if needed):
```javascript
// Check current indexes
db.users.getIndexes()

// Drop and recreate if having issues
db.users.dropIndex("collegeIdCardHash_1")
db.users.dropIndex("selfieHash_1")

// Restart server to recreate indexes with new schema
```

---

## 📊 Database Schema Changes

### OTPVerification Collection:
```javascript
{
  identifier: String (email),
  otp: String (6-digit),
  type: 'email' | 'mobile',
  expiresAt: Date (TTL index - auto-deletes),
  verified: Boolean,
  attempts: Number,
  createdAt: Date
}
```

**Indexes:**
- `identifier + type` (compound index)
- `expiresAt` (TTL index for auto-cleanup)

### User Model Changes:
```javascript
{
  collegeIdCardHash: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined  // ← Changed from null
  },
  selfieHash: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined  // ← Changed from null
  }
}
```

**Key Change:** Using `undefined` instead of `null` prevents MongoDB from storing null values, avoiding duplicate key errors on sparse indexes.

---

## ✅ Testing Checklist

- [ ] Send OTP to new email → OTP received
- [ ] Verify OTP with correct code → Verified
- [ ] Verify OTP with wrong code → Error with attempts remaining
- [ ] Complete registration after OTP → User created
- [ ] Try to send OTP to existing email → Error
- [ ] Try to register without OTP verification → Error
- [ ] Check MongoDB: No user created until Step 3
- [ ] Check MongoDB: OTP record exists after Step 1
- [ ] Check MongoDB: OTP deleted after Step 3
- [ ] Test with expired OTP → Error
- [ ] Test with multiple incorrect attempts → Blocked
- [ ] Verify no duplicate key errors occur

---

## 🎯 Key Benefits of New Flow

1. **No Premature User Creation**
   - Users only created after email verification
   - Prevents incomplete registrations

2. **Separate OTP Storage**
   - OTP data isolated from user data
   - Automatic cleanup with TTL indexes

3. **No Duplicate Key Errors**
   - `undefined` default prevents null duplicates
   - Sparse indexes work correctly

4. **Better Security**
   - OTP expiry enforced (10 minutes)
   - Attempt limiting (max 5 tries)
   - Verification window (30 minutes after OTP verification)

5. **Clean Database**
   - Old OTPs auto-deleted
   - No orphaned user records
   - Clear verification status

---

## 🚀 Frontend Integration Example

```javascript
// Step 1: Send OTP
const sendOTP = async (email, firstName, lastName) => {
  const response = await fetch('http://localhost:5000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, firstName, lastName })
  })
  return response.json()
}

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  })
  return response.json()
}

// Step 3: Complete Registration
const completeRegistration = async (userData) => {
  const response = await fetch('http://localhost:5000/api/auth/complete-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  return response.json()
}

// Usage
const handleRegistration = async () => {
  // Step 1
  const otpResult = await sendOTP(email, firstName, lastName)
  
  // Step 2 (after user enters OTP)
  const verifyResult = await verifyOTP(email, otpCode)
  
  // Step 3 (after OTP verified)
  if (verifyResult.verified) {
    const registerResult = await completeRegistration({
      firstName, lastName, email, password, phone, college, ...
    })
    
    if (registerResult.success) {
      localStorage.setItem('token', registerResult.token)
      // Redirect to dashboard
    }
  }
}
```

---

## 📝 Summary

**Before:** User created → OTP sent → Duplicate errors ❌

**After:** OTP sent → OTP verified → User created ✅

**Result:**
- ✅ No duplicate key errors
- ✅ Clean OTP flow
- ✅ Better security
- ✅ Proper email verification
- ✅ No orphaned records

---

**Status: Ready for Production Testing! 🎉**
