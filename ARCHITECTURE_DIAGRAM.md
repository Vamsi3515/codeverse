# Student Coordinator Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CODEVERSE CAMPUS                         │
│            Multi-College Hackathon Platform                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐  ┌──────────────────────────────┐
│     FRONTEND (React)         │  │     BACKEND (Express)        │
├──────────────────────────────┤  ├──────────────────────────────┤
│                              │  │                              │
│ OrganizerRegister.jsx       │  │ authController.js            │
│  ├─ Login Tab              │  │  ├─ signup                  │
│  ├─ Register Tab           │  │  ├─ login                  │
│  ├─ Student Coordinator Tab│ ──→ ├─ registerAsCoordinator  │
│  │   (NEW)                │  │  ├─ verifyEmailOTP        │
│  │                        │  │  └─ completeRegistration  │
│                              │                              │
│ Auth Headers                │  │ authRoutes.js               │
│  ├─ Authorization Header    │  │  ├─ POST /signup          │
│  ├─ JWT Token              │  │  ├─ POST /login           │
│  └─ User Roles (NEW)       │  │  ├─ POST /register-coord. │
│                              │  │  └─ GET /me              │
│                              │  │                              │
└──────────────────────────────┘  │ auth.js (Middleware)       │
         │                        │  ├─ protect               │
         │                        │  ├─ authorize             │
         │ API Calls             │  └─ checkHackathonCreator │
         ▼                        │      (UPDATED)            │
    ┌─────────────────┐          └──────────────────────────────┘
    │  HTTP/REST      │                    │
    │  /api/auth/*    │                    ▼
    └─────────────────┘            ┌──────────────────┐
                                   │   MongoDB        │
                                   ├──────────────────┤
                                   │ users collection │
                                   │  ├─ role (OLD)   │
                                   │  ├─ roles (NEW)  │
                                   │  ├─ email        │
                                   │  ├─ password     │
                                   │  ├─ college      │
                                   │  ├─ verification │
                                   │  │  ├─ email OTP │
                                   │  │  ├─ ID card   │
                                   │  │  └─ selfie    │
                                   │  └─ metadata     │
                                   └──────────────────┘
```

---

## Request Flow: Student Coordinator Registration

```
FRONTEND                                BACKEND                             DATABASE
   │                                       │                                  │
   │ 1. User enters email                 │                                  │
   │    (in Student Coordinator tab)      │                                  │
   │                                       │                                  │
   ├──────────────────────────────────────→│                                  │
   │ POST /api/auth/register-coordinator   │                                  │
   │ { email: "student@college.edu" }     │                                  │
   │                                       │                                  │
   │                                       ├─────────────────────────────────→│
   │                                       │ Find user by email               │
   │                                       │                                  │
   │                                       │←─────────────────────────────────┤
   │                                       │ User found with verification     │
   │                                       │                                  │
   │                                       ├─ Validate:                      │
   │                                       │  ✓ Has STUDENT role?            │
   │                                       │  ✓ Not already COORDINATOR?     │
   │                                       │  ✓ Email verified?              │
   │                                       │  ✓ ID card uploaded?            │
   │                                       │  ✓ Selfie captured?             │
   │                                       │                                  │
   │                                       │ ALL CHECKS PASS ✓              │
   │                                       │                                  │
   │                                       ├─────────────────────────────────→│
   │                                       │ Append STUDENT_COORDINATOR      │
   │                                       │ to roles array                   │
   │                                       │ Save user                        │
   │                                       │                                  │
   │                                       │ roles: [                         │
   │                                       │   "STUDENT",                     │
   │                                       │   "STUDENT_COORDINATOR"          │
   │                                       │ ]                                │
   │                                       │                                  │
   │                                       │←─────────────────────────────────┤
   │                                       │ User saved successfully          │
   │                                       │                                  │
   │                      Generate JWT    │                                  │
   │←──────────────────────────────────────┤                                  │
   │ 2. Success Response:                  │                                  │
   │ {                                     │                                  │
   │   token: "jwt_token",                 │                                  │
   │   user: {                             │                                  │
   │     roles: ["STUDENT",                │                                  │
   │             "STUDENT_COORDINATOR"]    │                                  │
   │   }                                   │                                  │
   │ }                                     │                                  │
   │                                       │                                  │
   ├─ Save token to localStorage          │                                  │
   ├─ Save roles to localStorage          │                                  │
   ├─ Redirect to /dashboard/organizer    │                                  │
   │                                       │                                  │
   ▼                                       ▼                                  ▼
```

---

## Data Flow: Single Account with Multiple Roles

```
TIMELINE: Student Journey

T=0: Student Registration
┌───────────────────────────────┐
│ Creates account               │
├───────────────────────────────┤
│ Document Created:             │
│ {                             │
│   _id: "user123",             │
│   email: "john@college.edu",  │
│   role: "student",            │
│   roles: ["STUDENT"],         │
│   verification: {             │
│     emailVerified: true,      │
│     collegeIdCard: "...",     │
│     liveSelfie: "..."         │
│   },                          │
│   isVerified: true            │
│ }                             │
└───────────────────────────────┘

T=Later: Student Becomes Coordinator
┌───────────────────────────────┐
│ Enters email in coordinator   │
│ registration form             │
└───────────────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│ System:                       │
│ 1. Finds user by email       │
│ 2. Validates verifications   │
│ 3. Appends new role          │
│ 4. Saves document            │
└───────────────────────────────┘
         │
         ▼
┌───────────────────────────────┐
│ Updated Document:             │
│ {                             │
│   _id: "user123",  ← SAME!    │
│   email: "john@college.edu",  │
│   role: "student",            │
│   roles: [                    │
│     "STUDENT",   ←────────┐  │
│     "STUDENT_COORDINATOR" │  │
│   ],         ←────────────┘   │
│   verification: {             │
│     emailVerified: true,      │
│     collegeIdCard: "...",     │
│     liveSelfie: "..."  ← REUSED
│   },                          │
│   isVerified: true            │
│ }                             │
└───────────────────────────────┘

KEY POINTS:
✓ Same document (_id)
✓ Same verification data
✓ Roles array appended, NOT replaced
✓ No new collections or duplicates
```

---

## Authorization Middleware Flow

```
User Makes Request
       │
       ▼
┌─────────────────────────────┐
│ protect middleware:         │
│ Extract JWT from header     │
│ Verify token                │
│ Load user from DB           │
│ Attach to req.user          │
└─────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ checkHackathonCreatorRole:  │
│                             │
│ Check both:                 │
│ 1. req.user.role (old)      │
│    └─ 'organizer'?          │
│ 2. req.user.roles (new)     │
│    └─ includes              │
│       'ORGANIZER' or        │
│       'STUDENT_COORDINATOR' │
└─────────────────────────────┘
       │
    ┌──┴──┐
    ▼     ▼
  YES    NO
   │      │
   ▼      ▼
  NEXT  ERROR
          403
```

---

## Database Schema Evolution

```
USER COLLECTION - BEFORE

{
  _id: ObjectId(),
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String,
  role: String,           ← Only ONE role!
    enum: ['student', 'organizer', 'admin']
  collegeIdCard: String,
  liveSelfie: String,
  isVerified: Boolean,
  ...metadata
}

LIMITATION:
- Cannot be student AND organizer simultaneously
- Would need duplicate account for both


USER COLLECTION - AFTER

{
  _id: ObjectId(),
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String,
  
  role: String,           ← Kept for backward compatibility
    enum: ['student', 'organizer', 'admin', ...]
  
  roles: [String],        ← NEW: Multiple roles!
    enum: ['STUDENT', 'STUDENT_COORDINATOR', 'ORGANIZER', 'ADMIN']
    default: ['STUDENT']
  
  collegeIdCard: String,
  liveSelfie: String,
  isVerified: Boolean,
  ...metadata
}

IMPROVEMENT:
- Can be both STUDENT and STUDENT_COORDINATOR
- Single document, single email
- Backward compatible
- Forward scalable to more roles
```

---

## Verification State Machine

```
STUDENT PATH:
┌──────────────┐    Email    ┌──────────────────┐   ID Card   ┌──────────────┐
│   CREATED    │ ─OTP Verify→│  EMAIL_VERIFIED  │ ─Upload────→│  ID_VERIFIED │
└──────────────┘             └──────────────────┘             └──────────────┘
                                                                      │
                                                                   Selfie
                                                                      │
                                                                      ▼
                                                              ┌──────────────┐
                                                              │   VERIFIED   │
                                                              │ roles:       │
                                                              │ [STUDENT]    │
                                                              └──────────────┘
                                                                      │
                                                           Coordinator Register
                                                                      │
                                                                      ▼
                                                              ┌──────────────┐
                                                              │  COORDINATOR │
                                                              │ roles:       │
                                                              │ [STUDENT,    │
                                                              │  STUDENT_CO] │
                                                              └──────────────┘

ORGANIZER PATH (separate):
┌──────────────┐    Email    ┌──────────────────┐   Documents ┌──────────────┐
│   CREATED    │ ─OTP Verify→│  EMAIL_VERIFIED  │ ─Upload────→│  ORGANIZER   │
└──────────────┘             └──────────────────┘             └──────────────┘
                                                              roles:[ORGANIZER]
```

---

## Request/Response Examples

### Success: Register as Coordinator

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register-coordinator \
  -H "Content-Type: application/json" \
  -d '{"email":"john@college.edu"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered as Student Coordinator! Your student verification has been reused.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@college.edu",
    "role": "student",
    "roles": ["STUDENT", "STUDENT_COORDINATOR"],
    "college": "ABC College",
    "isEmailVerified": true,
    "isVerified": true
  }
}
```

---

### Error: Email Not Registered

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register-coordinator \
  -H "Content-Type: application/json" \
  -d '{"email":"unregistered@college.edu"}'
```

**Response:**
```json
{
  "success": false,
  "message": "Email not registered. Please register as a student first.",
  "isNewUser": true
}
```

---

### Error: Already Coordinator

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register-coordinator \
  -H "Content-Type: application/json" \
  -d '{"email":"john@college.edu"}'
```

**Response (after already registered as coordinator):**
```json
{
  "success": false,
  "message": "You are already registered as a Student Coordinator. Go to login to access organizer portal.",
  "alreadyCoordinator": true
}
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  OrganizerRegister Component                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── Tab Navigation ────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  [Login] [Register] [🎓 Student Coordinator]             │ │
│  │                     (NEW TAB)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─── Coordinator Tab Content (when active) ────────────────┐ │
│  │                                                            │ │
│  │  Info Box:                                                │ │
│  │  "Already a registered student? Use this to add          │ │
│  │   coordinator privileges to your existing account."       │ │
│  │                                                            │ │
│  │  [Email Input]                                            │ │
│  │  "Your Student Email"                                     │ │
│  │  ├─ onChange: setCoordinatorEmail()                       │ │
│  │                                                            │ │
│  │  [Submit Button]                                          │ │
│  │  "Register as Coordinator"                               │ │
│  │  └─ onClick: handleCoordinatorRegister()                  │ │
│  │                                                            │ │
│  │  Info Box (success):                                      │ │
│  │  "What happens next:                                      │ │
│  │   ✓ Verification data reused                              │ │
│  │   ✓ No duplicate account                                  │ │
│  │   ✓ Immediate dashboard access                            │ │
│  │   ✓ Can create hackathons"                                │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          │                                      │
│                    handleCoordinatorRegister()                 │
│                          │                                      │
│        ┌─────────────────┼─────────────────┐                  │
│        │                 │                 │                  │
│        ▼                 ▼                 ▼                  │
│    [Validate]   [API Call]         [Handle Response]         │
│    ├─ Email      POST /api/auth/   ├─ Success:              │
│    │ required    register-coordinator│   Save token         │
│    │            │                  │   Redirect to dash    │
│    ├─ Has @     │                  │                        │
│    │            │                  ├─ Error:               │
│    └─ Format    │                  │   Show message         │
│                 │                  │   Ask to register      │
│                 └──────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Storage Flow

```
FRONTEND STORAGE (localStorage)

After Student Registration:
├─ token: "jwt_token_student"
├─ userRole: "student"
├─ userRoles: ["STUDENT"]
├─ organizerName: "John Doe"
└─ userCollege: "ABC College"

After Coordinator Registration (same user):
├─ token: "jwt_token_coordinator" ← NEW TOKEN
├─ userRole: "student" ← Still "student" (backward compat)
├─ userRoles: ["STUDENT", "STUDENT_COORDINATOR"] ← UPDATED!
├─ organizerName: "John Doe"
└─ userCollege: "ABC College"

BACKEND (MongoDB)

User Document:
├─ _id: ObjectId(...) ← SAME
├─ email: "john@college.edu" ← SAME
├─ firstName: "John" ← SAME
├─ role: "student" ← SAME
├─ roles: ["STUDENT", "STUDENT_COORDINATOR"] ← APPENDED
├─ collegeIdCard: "..." ← SAME (REUSED)
├─ liveSelfie: "..." ← SAME (REUSED)
├─ isEmailVerified: true ← SAME
└─ isVerified: true ← UPDATED (ensures coordinator access)
```

---

This completes the architectural overview of the Student Coordinator registration system.
