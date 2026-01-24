# Student Coordinator Registration - Implementation Guide

## Overview
This document describes the complete Student Coordinator registration feature that allows existing students to upgrade their accounts to have organizer/coordinator privileges without creating duplicate accounts.

## Key Features

### ✅ Single Account with Multiple Roles
- **Before**: Each user had only ONE role
- **After**: Users now have a `roles` array supporting `["STUDENT"]`, `["STUDENT", "STUDENT_COORDINATOR"]`, or `["ORGANIZER"]`
- **Backward Compatibility**: Legacy `role` field is maintained for existing code

### ✅ No Duplicate Accounts
- Student registers once with full verification (email OTP, ID card, selfie)
- When registering as coordinator, system detects existing account by email
- **STUDENT_COORDINATOR** role is **APPENDED** to the user's roles array
- Verification data is **REUSED** (no re-verification needed)

### ✅ Automatic Verification Reuse
- Student's existing verification (email, ID card, selfie) is automatically applied
- Coordinator account is marked as verified immediately
- No additional documents needed

## Flow Diagram

```
┌─────────────────────────────────────────────┐
│   STUDENT REGISTRATION (Existing)           │
├─────────────────────────────────────────────┤
│ 1. Register with college email              │
│ 2. Verify email with OTP                    │
│ 3. Upload college ID card                   │
│ 4. Capture live selfie                      │
│ → roles = ["STUDENT"]                       │
│ → isVerified = true                         │
└────────────────────┬────────────────────────┘
                     │
                     ▼ (Later, student wants to organize)
┌─────────────────────────────────────────────┐
│   UPGRADE TO STUDENT COORDINATOR            │
├─────────────────────────────────────────────┤
│ 1. Click "Student Coordinator" tab          │
│ 2. Enter the email used for registration    │
│ 3. System detects existing student account  │
│ 4. Verifies all prerequisites are complete  │
│ 5. Appends "STUDENT_COORDINATOR" to roles   │
│ → roles = ["STUDENT", "STUDENT_COORDINATOR"]│
│ → isVerified = true                         │
│ → Can now create hackathons                 │
└─────────────────────────────────────────────┘
```

## Implementation Details

### 1. Backend Changes

#### User Model (models/User.js)
```javascript
// NEW: Multiple roles array (replacing single role field)
roles: {
  type: [String],
  enum: ['STUDENT', 'STUDENT_COORDINATOR', 'ORGANIZER', 'ADMIN'],
  default: ['STUDENT'],
}

// OLD: Kept for backward compatibility
role: {
  type: String,
  enum: ['student', 'admin', 'organizer', 'ORGANIZER', 'STUDENT_COORDINATOR'],
  default: 'student',
}
```

#### New API Endpoint
**POST** `/api/auth/register-coordinator`

**Request Body:**
```json
{
  "email": "student@college.edu"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully registered as Student Coordinator! Your student verification has been reused.",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "student@college.edu",
    "role": "student",
    "roles": ["STUDENT", "STUDENT_COORDINATOR"],
    "college": "ABC College",
    "isEmailVerified": true,
    "isVerified": true
  }
}
```

**Response (Error - Email not registered):**
```json
{
  "success": false,
  "message": "Email not registered. Please register as a student first.",
  "isNewUser": true
}
```

**Response (Error - Already coordinator):**
```json
{
  "success": false,
  "message": "You are already registered as a Student Coordinator. Go to login to access organizer portal.",
  "alreadyCoordinator": true
}
```

#### Verification Logic
The endpoint performs these checks:

1. **Email exists**: Looks up user by email
2. **Is student**: Verifies user has STUDENT role
3. **Not already coordinator**: Checks if STUDENT_COORDINATOR role is NOT already assigned
4. **Verification complete**: Ensures:
   - ✅ Email verified
   - ✅ ID card uploaded
   - ✅ Selfie captured

If ANY check fails, a descriptive error is returned.

#### Access Control Middleware (middleware/auth.js)
Updated `checkHackathonCreatorRole` to support both:
- Legacy role field
- New roles array

```javascript
const hasAllowedRole = allowedRoles.includes(req.user.role);
const hasAllowedRoleInArray = req.user.roles && 
  (req.user.roles.includes('ORGANIZER') || 
   req.user.roles.includes('STUDENT_COORDINATOR'));
```

### 2. Frontend Changes

#### New Tab in OrganizerRegister.jsx
Added "🎓 Student Coordinator" tab alongside Login and Register.

**Features:**
- Simple email input
- Clear instructions about account reuse
- Success/error messaging
- Auto-redirect to organizer dashboard on success

**User Experience:**
```
Enter Email → Verify Account → Redirect to Dashboard
```

## Testing Checklist

### ✅ Test 1: Student Registration (Existing Flow)
1. Go to `/register` (Student portal)
2. Register with college email
3. Verify email with OTP
4. Upload ID card
5. Capture selfie
6. **Verify in DB**: `roles = ["STUDENT"]`, `isVerified = true`

### ✅ Test 2: Upgrade to Coordinator (Same Account)
1. Go to `/organizer-register`
2. Click "🎓 Student Coordinator" tab
3. Enter the email from Test 1
4. Click "Register as Coordinator"
5. Should see success message
6. **Verify in DB**: `roles = ["STUDENT", "STUDENT_COORDINATOR"]`
7. **Verify NO new user created**: Same `_id`, same email

### ✅ Test 3: Error Cases
1. **Non-registered email**: Should show "Please register as student first"
2. **Incomplete student verification**: Should show specific missing verification
3. **Already coordinator**: Should show "Already registered as coordinator"

### ✅ Test 4: Access Control
1. Login as student coordinator
2. Go to `/create-hackathon`
3. Should be able to create hackathon
4. Verify `createdByRole` in DB shows permission

### ✅ Test 5: Token & LocalStorage
After coordinator registration:
- ✅ JWT token saved
- ✅ `userRoles` includes both STUDENT and STUDENT_COORDINATOR
- ✅ Can access organizer dashboard

## Database Queries

### Check User Roles
```javascript
// Find student who is now also coordinator
db.users.findOne({ 
  email: "student@college.edu",
  roles: { $all: ["STUDENT", "STUDENT_COORDINATOR"] }
})
```

### Count Coordinator Registrations
```javascript
db.users.countDocuments({ 
  roles: "STUDENT_COORDINATOR" 
})
```

## API Routes Summary

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/auth/signup` | No | Student registration (creates account) |
| POST | `/auth/register-coordinator` | No | Upgrade student to coordinator |
| POST | `/auth/login` | No | Login (returns roles array) |
| GET | `/auth/me` | Yes | Get current user (includes roles) |
| POST | `/hackathons` | Yes* | Create hackathon (*requires ORGANIZER or STUDENT_COORDINATOR) |

## Backward Compatibility

✅ **Existing code still works** because:
- Old `role` field is still present
- Legacy role values ('student', 'organizer') are still used
- Middleware checks BOTH `role` and `roles` array
- Login returns both fields

✅ **Migration path** is optional:
- Existing users keep single role
- New users can use roles array
- Mixed system works seamlessly

## Known Limitations & Future Improvements

### Current Limitations
1. **Organizer Registration**: Still requires full verification (not implemented as coordinator upgrade)
   - *Reason*: Organizers are institution-level, students are individual-level
   
2. **Role Removal**: Once added, STUDENT_COORDINATOR role cannot be removed
   - *Reason*: Prevented accidental downgrades; can be added if needed

### Future Enhancements
1. Add admin panel to manage roles
2. Implement role hierarchy (ADMIN > ORGANIZER > COORDINATOR > STUDENT)
3. Add role expiration/renewal
4. Implement role-specific permissions system

## File Changes Summary

### Backend Files Modified
1. ✅ `src/models/User.js` - Added roles array
2. ✅ `src/controllers/authController.js` - Added registerAsCoordinator endpoint
3. ✅ `src/routes/authRoutes.js` - Added new route
4. ✅ `src/middleware/auth.js` - Updated authorization checks

### Frontend Files Modified
1. ✅ `src/pages/OrganizerRegister.jsx` - Added Student Coordinator tab

## Deployment Checklist

Before deploying to production:

- [ ] Run all tests from Testing Checklist
- [ ] Test with real email verification
- [ ] Verify no duplicate accounts in DB after upgrade
- [ ] Test role-based access control
- [ ] Update API documentation
- [ ] Notify users about new feature
- [ ] Monitor error logs for edge cases

## Support & Troubleshooting

### Issue: "Email not registered"
- **Cause**: User trying coordinator registration without student account
- **Solution**: Complete student registration first

### Issue: "Email verification incomplete"
- **Cause**: Student skipped email/ID/selfie verification
- **Solution**: Complete student verification before upgrading

### Issue: Duplicate accounts in database
- **Cause**: Should NOT happen with this implementation
- **Action**: Check email uniqueness constraint, run data cleanup

### Issue: Role not updating
- **Cause**: Cache issue or middleware not updated
- **Solution**: Clear browser cache, restart server

## References

- [Roles Schema](./backend/src/models/User.js#L35-L45)
- [Coordinator Registration Endpoint](./backend/src/controllers/authController.js#L1109)
- [Frontend Coordinator Tab](./frontend/codeverse-campus/src/pages/OrganizerRegister.jsx#L70)
- [Authorization Middleware](./backend/src/middleware/auth.js#L39)
