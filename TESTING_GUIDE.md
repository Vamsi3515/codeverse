# 🧪 TESTING GUIDE - Secure Student Registration

## 🚀 Quick Start

### 1. Restart Backend Server
The backend server needs to be restarted to load the new OTP routes.

**Option A - Kill existing and restart:**
```powershell
# Find Node.js process
Get-Process node | Stop-Process -Force

# Start backend
cd backend
npm run dev
```

**Option B - If server already running:**
Just make sure backend server is running on port 5000.

### 2. Ensure Frontend is Running
```powershell
cd frontend/codeverse-campus
npm run dev
```

---

## 📝 Test Scenario 1: Complete Registration Flow

### Step 1: Navigate to Registration
1. Open browser: http://localhost:5173
2. Click "Sign Up"
3. Click "Sign Up as Student"

### Step 2: Fill Basic Information
```
Full Name: Test Student
College Name: Test University
College Location: Test City
College Email: test@example.com
Phone Number: +919876543210
Roll Number: TEST001
Password: Test123456
Confirm Password: Test123456
```

### Step 3: Email Verification
1. Click **"Send OTP"** next to email field
2. Check **backend console** for OTP (since EMAIL_USER not configured, it will show error but OTP is saved)
3. OR check your email if you configured EMAIL_USER/PASSWORD in .env
4. Enter the 6-digit OTP in the input field that appears
5. Click **"Verify"**
6. ✅ Should show "Email verified successfully!"
7. Email field becomes disabled and shows green checkmark

### Step 4: Mobile Verification
1. Click **"Send OTP"** next to phone field
2. Check **backend console** - will show:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📱 SMS NOTIFICATION (DEMO MODE)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   To: +919876543210
   Message: Your CodeVerse Campus verification code is: 123456
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
3. Copy the OTP from console
4. Enter the 6-digit OTP
5. Click **"Verify"**
6. ✅ Should show "Mobile number verified successfully!"
7. Phone field becomes disabled and shows green checkmark

### Step 5: Camera Verification
1. Click **"Open Camera"**
2. Browser will ask for camera permission - **Allow it**
3. Your camera feed should appear in the preview box
4. Click **"Capture Selfie"**
5. ✅ Captured image should appear in preview
6. Camera verification shows green checkmark

### Step 6: Final Registration
1. Check the requirements checklist:
   ```
   ✓ Verify email with OTP (should be crossed out in green)
   ✓ Verify mobile with OTP (should be crossed out in green)
   ✓ Capture selfie (should be crossed out in green)
   ```
2. Click **"Register"** button
3. ✅ Should show: "Registration successful! All verifications completed."
4. Automatically redirects to `/login/student`

### Step 7: Verify in MongoDB
Open MongoDB Compass or Atlas Data Browser:
```javascript
// Query: db.users.find({email: "test@example.com"})
{
  "firstName": "Test",
  "lastName": "Student",
  "email": "test@example.com",
  "phone": "+919876543210",
  "college": "Test University",
  "password": "$2a$10$...", // hashed
  "role": "student",
  "emailVerified": true,
  "mobileVerified": true,
  "cameraVerified": true,
  "isVerified": true
}
```

---

## 🔴 Test Scenario 2: Registration Without Verifications

### Test A: Try to register without email verification
1. Fill all fields
2. **DON'T** verify email (skip OTP)
3. Verify mobile
4. Capture selfie
5. Click "Register"
6. ❌ Should show: "Please complete all verification steps"
7. ❌ Error: "Please verify your email first"

### Test B: Try to register without mobile verification
1. Fill all fields
2. Verify email
3. **DON'T** verify mobile (skip OTP)
4. Capture selfie
5. Click "Register"
6. ❌ Should show: "Please complete all verification steps"
7. ❌ Error: "Please verify your mobile number first"

### Test C: Try to register without camera
1. Fill all fields
2. Verify email
3. Verify mobile
4. **DON'T** capture selfie
5. Click "Register"
6. ❌ Should show: "Please complete all verification steps"
7. ❌ Error: "Camera verification is mandatory"

---

## 🕒 Test Scenario 3: OTP Expiry

### Test OTP Expiration (5 minutes)
1. Request email OTP
2. **Wait 6 minutes** (don't verify)
3. Try to verify with the OTP
4. ❌ Should show: "OTP expired. Please request a new one."

---

## 🔢 Test Scenario 4: Invalid OTP Attempts

### Test Maximum Attempts (3)
1. Request email OTP
2. Enter wrong OTP - Try 1
3. ❌ "Invalid OTP"
4. Enter wrong OTP - Try 2
5. ❌ "Invalid OTP"
6. Enter wrong OTP - Try 3
7. ❌ "Too many failed attempts. Please request a new OTP."
8. OTP is deleted from database

---

## 🚫 Test Scenario 5: Duplicate Registration

### Test Duplicate Email
1. Register successfully with: test@example.com
2. Try to register again with same email
3. When sending email OTP:
4. ❌ Should show: "Email already registered"

### Test Duplicate Phone
1. Register successfully with: +919876543210
2. Try to register again with same phone
3. When sending mobile OTP:
4. ❌ Should show: "Phone number already registered"

---

## 🔍 Backend Console Monitoring

While testing, watch the backend console for:

### Email OTP Sending:
```
Email OTP Sent (Check console since EMAIL not configured)
OTP: 123456
Expires: 5 minutes
```

### Mobile OTP Sending:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 SMS NOTIFICATION (DEMO MODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: +919876543210
Message: Your CodeVerse Campus verification code is: 654321
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### MongoDB Connection:
```
MongoDB Connected: ac-r6cvrwn-shard-00-00.rarnzxt.mongodb.net
```

### Successful Registration:
```
POST /api/otp/register-student 201
```

---

## 📧 Email Configuration (Optional)

To test with real email sending:

### 1. Update `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### 2. Get Gmail App Password:
1. Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords"
4. Select "Mail" and your device
5. Copy generated password

### 3. Restart backend:
```powershell
cd backend
npm run dev
```

### 4. Test:
- Request email OTP
- Check your email inbox
- Should receive formatted email with OTP

---

## 🐛 Troubleshooting

### Issue: "Unable to connect to server"
**Solution:** Ensure backend is running on port 5000
```powershell
cd backend
npm run dev
```

### Issue: Camera not working
**Solution:** 
- Use HTTPS or localhost (HTTP allowed on localhost)
- Check browser permissions
- Try different browser (Chrome recommended)

### Issue: OTP not in console
**Solution:**
- Check backend console (not frontend)
- Ensure MongoDB is connected
- Check for errors in backend logs

### Issue: "Email already registered"
**Solution:**
- Use different email
- Or delete test user from MongoDB:
```javascript
db.users.deleteOne({email: "test@example.com"})
```

### Issue: Port 5000 already in use
**Solution:**
```powershell
# Find and kill process
Get-Process node | Stop-Process -Force

# Or change port in backend/.env
PORT=5001
```

---

## ✅ Expected Results Summary

| Test Case | Expected Result |
|-----------|----------------|
| Complete registration with all verifications | ✅ Success → Redirect to login |
| Register without email OTP | ❌ "Please verify your email first" |
| Register without mobile OTP | ❌ "Please verify your mobile number first" |
| Register without camera | ❌ "Camera verification is mandatory" |
| Wrong OTP 3 times | ❌ "Too many failed attempts" |
| OTP after 5 minutes | ❌ "OTP expired" |
| Duplicate email | ❌ "Email already registered" |
| Duplicate phone | ❌ "Phone number already registered" |
| Password not matching | ❌ "Passwords do not match" |

---

## 🎯 Success Criteria

✅ All verification steps must pass before registration  
✅ MongoDB contains only fully verified users  
✅ Passwords are hashed (never plain text)  
✅ OTPs expire after 5 minutes  
✅ Maximum 3 OTP verification attempts  
✅ Email/phone uniqueness enforced  
✅ Camera verification is mandatory  
✅ UI shows clear verification status  

**Ready to test!** 🚀
