# Quick Start: Test Student Coordinator Registration

## Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- MongoDB connected

## Step-by-Step Testing

### ✅ STEP 1: Register as Student
1. Go to `http://localhost:5173/register` (Student Portal)
2. Fill in the form:
   ```
   Name: John Doe
   Email: john@college.edu (college email)
   Phone: 9876543210
   College: ABC College
   Password: Test@123
   ```
3. Verify email with OTP (check backend logs for OTP)
4. Upload College ID Card
5. Capture Live Selfie
6. Click Register

**Expected Result:**
- ✅ Account created with `roles: ["STUDENT"]`
- ✅ All verification complete
- ✅ Redirect to student dashboard

### ✅ STEP 2: Upgrade to Student Coordinator
1. Go to `http://localhost:5173/organizer-register` (Organizer Portal)
2. Click **"🎓 Student Coordinator"** tab
3. Enter: `john@college.edu`
4. Click **"Register as Coordinator"**

**Expected Result:**
- ✅ Success message appears
- ✅ Auto-redirect to organizer dashboard
- ✅ Token saved in localStorage
- ✅ `userRoles` shows both STUDENT and STUDENT_COORDINATOR

### ✅ STEP 3: Verify in Database
```javascript
// In MongoDB shell:
db.users.findOne({ email: "john@college.edu" })

// Expected output:
{
  _id: ObjectId(...),
  email: "john@college.edu",
  firstName: "John",
  lastName: "Doe",
  roles: ["STUDENT", "STUDENT_COORDINATOR"],  // ← Both roles!
  role: "student",                             // ← Backward compatible
  isEmailVerified: true,
  collegeIdCard: "...",
  liveSelfie: "...",
  isVerified: true,
  ...
}
```

### ✅ STEP 4: Create Hackathon
1. Login with coordinator account
2. Go to `http://localhost:5173/create-hackathon`
3. Create a test hackathon
4. Submit

**Expected Result:**
- ✅ Hackathon created successfully
- ✅ `createdByRole` shows "student" (or correct role in DB)
- ✅ User can manage hackathon

## Error Cases to Test

### ❌ Test: Email Not Registered
1. Go to Organizer Portal → Student Coordinator tab
2. Enter: `unregistered@college.edu`
3. Click Register

**Expected Error:**
```
Email not registered. Please register as a student first.
```

### ❌ Test: Incomplete Student Verification
1. Register student but skip selfie upload
2. Go to Student Coordinator tab
3. Enter that email

**Expected Error:**
```
Selfie verification incomplete. Please complete student registration first.
```

### ❌ Test: Already Coordinator
1. Register as coordinator (complete STEP 2)
2. Go to Student Coordinator tab again
3. Enter the same email

**Expected Error:**
```
You are already registered as a Student Coordinator. Please login.
```

## Database Cleanup (if needed)

```javascript
// Find all student coordinators:
db.users.find({ roles: "STUDENT_COORDINATOR" })

// Delete test user (BE CAREFUL):
db.users.deleteOne({ email: "john@college.edu" })

// Reset a user's roles to STUDENT only:
db.users.updateOne(
  { email: "john@college.edu" },
  { $set: { roles: ["STUDENT"] } }
)
```

## API Endpoints Reference

### 1. Register Coordinator
```bash
curl -X POST http://localhost:5000/api/auth/register-coordinator \
  -H "Content-Type: application/json" \
  -d '{"email":"john@college.edu"}'
```

### 2. Login (includes roles)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@college.edu","password":"Test@123"}'
```

### 3. Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer {your_token}"
```

## What to Verify

- [ ] User has `roles` array in DB
- [ ] STUDENT_COORDINATOR role is appended (not replaced)
- [ ] Only one user document in DB for this email
- [ ] Verification data (email, ID, selfie) is reused
- [ ] Can create hackathon with coordinator account
- [ ] Authorization middleware accepts new roles
- [ ] Frontend shows success message
- [ ] Token has correct permissions

## Logs to Check

**Backend Terminal:**
```
✅ User registered as Student Coordinator: john@college.edu
   Roles: STUDENT, STUDENT_COORDINATOR
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Roles undefined" | Ensure User.js model has roles field with default |
| "Cannot read property 'includes'" | Check if roles array is being initialized |
| Duplicate accounts created | Verify email uniqueness constraint in DB |
| Role not persisting | Check User model save() function |

## Next Steps After Testing

1. ✅ Run full test suite
2. ✅ Test with multiple users
3. ✅ Verify role-based access throughout app
4. ✅ Check frontend for roles array usage
5. ✅ Deploy to staging environment
6. ✅ Get college review approval
