# Problem Statement Management - System Architecture

## End-to-End Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    HACKATHON LIFECYCLE WITH PROBLEMS                     │
└──────────────────────────────────────────────────────────────────────────┘

ORGANIZER CREATES HACKATHON (Online Mode)
│
├─→ [Step 1: Create Hackathon]
│   POST /api/hackathons
│   {
│     title: "Code Challenge 2026",
│     mode: "online",
│     startDate: "2026-01-25",
│     problemStatements: []  ← Empty initially
│   }
│   ✓ Returns hackathonId
│
├─→ [Step 2: Add Problems]
│   POST /api/hackathons/{id}/problems
│   {
│     title: "Build Weather API",
│     description: "...",
│     resources: [...]
│   }
│   Repeat as needed...
│   ✓ problemCount = 1, 2, 3, ...
│
├─→ [Step 3: Publish Hackathon]
│   PUT /api/hackathons/{id}/publish
│   
│   VALIDATION CHAIN:
│   ├─ Is organizer? → YES
│   ├─ Is online mode? → YES
│   └─ Has problems? 
│       ├─ YES → ✅ PUBLISH ALLOWED
│       └─ NO → ❌ BLOCKED "Add at least one problem"
│
├─→ [Step 4: Dashboard View]
│   GET /api/hackathons/organizer/my-hackathons
│   
│   ALERT CHECK:
│   ├─ Mode = online? → YES
│   ├─ Problems = 0? → NO
│   └─ Within alert window? → NO
│   Result: No alert shown
│
└─→ STUDENT REGISTRATION OPENS
    POST /api/registrations
    
    VALIDATION CHAIN:
    ├─ Is online mode? → YES
    ├─ Has problems?
    │   ├─ YES → ✅ REGISTRATION ALLOWED
    │   └─ NO → ❌ BLOCKED "Hackathon not ready..."
    └─→ Student can now participate


ALTERNATIVE SCENARIO: Missing Problems
│
├─→ [Organizer forgot to add problems]
│   
├─→ [Tries to publish]
│   PUT /api/hackathons/{id}/publish
│   
│   ❌ BLOCKED
│   Response 400:
│   {
│     success: false,
│     message: "Please add at least one problem statement before publishing."
│   }
│
├─→ [Adds problems quickly]
│   POST /api/hackathons/{id}/problems ← CAN ADD ANYTIME BEFORE START
│   (works same day, same hour, even 1 min before start)
│
└─→ [Publishes again]
    ✅ NOW SUCCEEDS


ALERT SCENARIO: Approaching Start Time
│
├─→ [Organizer checks dashboard 24h before start]
│   GET /api/hackathons/organizer/my-hackathons
│   
│   Response includes:
│   {
│     title: "Code Challenge 2026",
│     mode: "online",
│     problemStatementAlert: {
│       type: "warning",
│       message: "Problem statements not added yet.",
│       severity: "medium"
│     }
│   }
│
├─→ [Organizer checks dashboard 1h before start]
│   
│   Response includes:
│   {
│     problemStatementAlert: {
│       type: "critical",
│       message: "Hackathon cannot start without problem statements.",
│       severity: "high"
│     }
│   }
│
└─→ [Hackathon starts → Problems are LOCKED]
    Can't add/edit/delete after this point
```

---

## Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Organizer Dashboard                                          │  │
│  │ - Problem Statement Form                                     │  │
│  │ - Problem List with Edit/Delete                              │  │
│  │ - Alert Banner if missing problems                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Calls API Endpoints                                          │  │
│  │ POST   /problems                                             │  │
│  │ PUT    /problems/:id                                         │  │
│  │ DELETE /problems/:id                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                   BACKEND ROUTES (Express)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ hackathonRoutes.js                                           │  │
│  │ POST   /:id/problems           → addProblemStatement         │  │
│  │ PUT    /:id/problems/:problemId → updateProblemStatement     │  │
│  │ DELETE /:id/problems/:problemId → deleteProblemStatement     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ hackathonController.js                                       │  │
│  │                                                              │  │
│  │ addProblemStatement()     ← CREATE logic                    │  │
│  │ ├─ Check: mode === 'online'                                │  │
│  │ ├─ Check: before start time                                │  │
│  │ ├─ Check: organizer authorization                          │  │
│  │ └─ ADD to problemStatements array                          │  │
│  │                                                              │  │
│  │ updateProblemStatement()   ← UPDATE logic                  │  │
│  │ ├─ Same checks as Add                                      │  │
│  │ └─ UPDATE specific problem in array                        │  │
│  │                                                              │  │
│  │ deleteProblemStatement()   ← DELETE logic                  │  │
│  │ ├─ Same checks as Add                                      │  │
│  │ └─ REMOVE from problemStatements array                     │  │
│  │                                                              │  │
│  │ publishHackathon()         ← PUBLISH VALIDATION            │  │
│  │ ├─ If mode === 'online'                                    │  │
│  │ └─ Check: problemStatements.length >= 1                    │  │
│  │                                                              │  │
│  │ getHackathonsByOrganizer() ← ALERT GENERATION              │  │
│  │ ├─ For each hackathon:                                     │  │
│  │ └─ Call checkProblemStatementAlerts()                      │  │
│  │     ├─ If online + no problems + near start                │  │
│  │     └─ Add alert to response                               │  │
│  │                                                              │  │
│  │ checkProblemStatementAlerts() ← ALERT LOGIC               │  │
│  │ ├─ Only for online mode                                    │  │
│  │ ├─ Only if problemCount === 0                              │  │
│  │ ├─ At 24h-1h: warning alert                               │  │
│  │ └─ At <1h: critical alert                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ registrationController.js                                    │  │
│  │                                                              │  │
│  │ registerForHackathon()     ← REGISTRATION VALIDATION       │  │
│  │ ├─ If mode === 'online'                                    │  │
│  │ ├─ Check: problemStatements.length >= 1                    │  │
│  │ └─ If 0 → BLOCK registration                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Middleware (auth.js)                                         │  │
│  │ - protect: Verify JWT token                                 │  │
│  │ - checkHackathonCreatorRole: Verify organizer role         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB)                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Hackathon Collection                                         │  │
│  │ {                                                            │  │
│  │   _id: ObjectId,                                             │  │
│  │   title: String,                                             │  │
│  │   mode: "online" | "offline" | "hybrid",                    │  │
│  │   startDate: Date,                                           │  │
│  │   organizer: ObjectId,                                       │  │
│  │   problemStatements: [                                      │  │
│  │     {                                                        │  │
│  │       _id: ObjectId,                                         │  │
│  │       title: String,                                         │  │
│  │       description: String,                                   │  │
│  │       resources: [String]                                    │  │
│  │     }                                                        │  │
│  │   ]                                                          │  │
│  │ }                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Write Operations:                                            │  │
│  │ - Create: $push problem to array                            │  │
│  │ - Update: $set specific problem field                       │  │
│  │ - Delete: $pull problem from array                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Validation Flow

```
API REQUEST
    │
    ▼
┌─────────────────────────────┐
│ AUTHENTICATION CHECK        │
│ Is token valid?             │
├─────────────────────────────┤
│ NO → 401 Unauthorized       │
│ YES → Continue              │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ AUTHORIZATION CHECK         │
│ Is user the organizer?      │
├─────────────────────────────┤
│ NO → 403 Forbidden          │
│ YES → Continue              │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ MODE CHECK                  │
│ Is hackathon online?        │
├─────────────────────────────┤
│ NO → 400 Bad Request        │
│ YES → Continue              │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ TIMING CHECK                │
│ Before start time?          │
├─────────────────────────────┤
│ NO → 400 Bad Request        │
│ YES → Continue              │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ INPUT VALIDATION            │
│ Required fields present?    │
├─────────────────────────────┤
│ NO → 400 Bad Request        │
│ YES → Continue              │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ DATABASE OPERATION          │
│ Add/Update/Delete problem   │
├─────────────────────────────┤
│ OK → 200 Success            │
│ ERROR → 500 Server Error    │
└─────────────────────────────┘
```

---

## Publishing Validation Detail

```
ORGANIZER CLICKS "PUBLISH"
    │
    ▼
PUT /api/hackathons/:id/publish
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 1: Verify Authorization             │
│ hackathon.organizer === req.user.id      │
├──────────────────────────────────────────┤
│ ✓ PASS → Continue                        │
│ ✗ FAIL → 403 "Not authorized"            │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 2: Validate Offline Requirements    │
│ If mode != "online":                     │
│   Check location fields exist            │
├──────────────────────────────────────────┤
│ ✓ PASS → Continue                        │
│ ✗ FAIL → 400 "Missing location"          │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 3: NEW - Problem Statement Check    │
│ If mode === "online":                    │
│   problemCount = problems.length         │
│   if (problemCount === 0)                │
│     return 400 error                     │
├──────────────────────────────────────────┤
│ ✓ PASS → Have problems or not online     │
│ ✗ FAIL → 400 "Add at least one problem"  │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 4: Set Status to Published          │
│ hackathon.status = "published"           │
│ await hackathon.save()                   │
├──────────────────────────────────────────┤
│ ✓ SUCCESS → 200 "Published successfully" │
│ ✗ ERROR → 500 "Server error"             │
└──────────────────────────────────────────┘
```

---

## Registration Validation Detail

```
STUDENT CLICKS "JOIN HACKATHON"
    │
    ▼
POST /api/registrations
{
  hackathonId: "...",
  ...
}
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 1: Find Hackathon                   │
│ hackathon = await Hackathon.findById()   │
├──────────────────────────────────────────┤
│ ✓ FOUND → Continue                       │
│ ✗ NOT FOUND → 404 "Hackathon not found"  │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 2: NEW - Problem Statement Check    │
│ If mode === "online":                    │
│   problemCount = problems.length         │
│   if (problemCount === 0)                │
│     return 400 error                     │
├──────────────────────────────────────────┤
│ ✓ PASS → Have problems or not online     │
│ ✗ FAIL → 400 "Not ready for registration"│
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 3: Check Capacity                   │
│ if registeredCount >= maxParticipants    │
│   return 400 error                       │
├──────────────────────────────────────────┤
│ ✓ PASS → Spots available                 │
│ ✗ FAIL → 400 "Hackathon is full"         │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 4: Offline Prerequisites            │
│ If mode === "offline" or "hybrid":       │
│   Verify email verified + ID + selfie    │
├──────────────────────────────────────────┤
│ ✓ PASS → All verified                    │
│ ✗ FAIL → 400 "Verify email/ID/selfie"   │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│ Step 5: Create Registration Record       │
│ Create and save Registration document    │
├──────────────────────────────────────────┤
│ ✓ SUCCESS → 200 "Registered successfully"│
│ ✗ ERROR → 500 "Server error"             │
└──────────────────────────────────────────┘
```

---

## Alert Generation Flow

```
ORGANIZER VIEWS DASHBOARD
    │
    ▼
GET /api/hackathons/organizer/my-hackathons
    │
    ▼
fetch all hackathons for this organizer
    │
    ▼
FOR EACH HACKATHON:
    │
    ├─→ Call checkProblemStatementAlerts(hackathon)
    │       │
    │       ▼
    │   Is mode === 'online'?
    │   ├─ NO → return null (no alert)
    │   └─ YES → Continue
    │       │
    │       ▼
    │   Does it have ≥1 problem?
    │   ├─ YES → return null (no alert)
    │   └─ NO → Continue
    │       │
    │       ▼
    │   Calculate time until start:
    │   hoursUntilStart = (startDate - now) / 3600000
    │       │
    │       ├─→ If 24 > hoursUntilStart > 1:
    │       │   return {
    │       │     type: "warning",
    │       │     message: "Problem statements not added yet.",
    │       │     severity: "medium"
    │       │   }
    │       │
    │       ├─→ If 1 >= hoursUntilStart > 0:
    │       │   return {
    │       │     type: "critical",
    │       │     message: "Hackathon cannot start without problems.",
    │       │     severity: "high"
    │       │   }
    │       │
    │       └─→ Otherwise: return null
    │
    ├─→ Add alert to hackathon object (if exists)
    │
    └─→ Continue to next hackathon

RESPONSE TO FRONTEND:
{
  success: true,
  hackathons: [
    {
      _id: "...",
      title: "My Hackathon",
      mode: "online",
      startDate: "2026-01-24T12:00:00Z",
      problemStatements: [],
      problemStatementAlert: {     ← INCLUDED IF ALERT TRIGGERED
        type: "critical",
        message: "Hackathon cannot start without problem statements.",
        severity: "high"
      }
    }
  ]
}
```

---

## Mode Behavior Matrix

```
╔════════════════════════════════════════════════════════════════════╗
║                    HACKATHON MODE BEHAVIOR                         ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║ ONLINE                                                             ║
║ ├─ Can add problems?              ✅ YES                           ║
║ ├─ Must have problem to publish?  ✅ YES (required)               ║
║ ├─ Must have problem to register? ✅ YES (required)               ║
║ ├─ Gets alerts?                   ✅ YES                          ║
║ ├─ Problems locked after start?   ✅ YES                          ║
║                                                                    ║
║ OFFLINE                                                            ║
║ ├─ Can add problems?              ❌ NO                           ║
║ ├─ Must have problem to publish?  ❌ NO                           ║
║ ├─ Must have problem to register? ❌ NO                           ║
║ ├─ Gets alerts?                   ❌ NO                           ║
║ ├─ Problems locked after start?   ❌ N/A                          ║
║                                                                    ║
║ HYBRID                                                             ║
║ ├─ Can add problems?              ❌ NO                           ║
║ ├─ Must have problem to publish?  ❌ NO                           ║
║ ├─ Must have problem to register? ❌ NO                           ║
║ ├─ Gets alerts?                   ❌ NO                           ║
║ ├─ Problems locked after start?   ❌ N/A                          ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Data Model

```
Hackathon Document Structure (Simplified):
{
  _id: ObjectId,
  title: "Code Challenge 2026",
  description: "...",
  college: "IIT Bombay",
  
  // PROBLEM STATEMENT FIELDS
  problemStatements: [
    {
      _id: ObjectId("507f1f77bcf86cd799439011"),
      title: "Build Weather API",
      description: "Create a REST API that...",
      resources: [
        "https://openweathermap.org/api",
        "https://github.com/examples"
      ]
    },
    {
      _id: ObjectId("507f1f77bcf86cd799439012"),
      title: "E-Commerce Platform",
      description: "Implement full-stack...",
      resources: [...]
    }
  ],
  
  // MODE AND TIMING
  mode: "online",                    // "online" | "offline" | "hybrid"
  startDate: ISODate("2026-01-25T12:00:00Z"),
  endDate: ISODate("2026-01-27T12:00:00Z"),
  
  // EXISTING FIELDS
  organizer: ObjectId("..."),
  status: "published",
  registeredCount: 150,
  maxParticipants: 200,
  ...
}

Response with Alerts (to Frontend):
{
  ...hackathon fields...,
  problemStatementAlert: {           // NEW FIELD
    type: "critical",
    message: "Hackathon cannot start without problem statements.",
    severity: "high"
  }
}
```

---

**Last Updated:** January 22, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
