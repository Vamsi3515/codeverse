# Role-Based Hackathon Creation - Quick Visual Guide

## 🎭 Three User Scenarios

---

## Scenario 1: College Organizer 👔

### Login Flow:
```
Login → role = 'ORGANIZER'
Dashboard Title: "Organizer Dashboard"
Create Button: ✅ VISIBLE
```

### Dashboard View:
```
┌─────────────────────────────────────────────────┐
│  Organizer Dashboard                  [+ Create]│
│  Manage your hackathons                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Scheduled Hackathons                           │
│  ┌──────────────────────────────┐              │
│  │ AI Innovation Challenge      │              │
│  │ Feb 1, 2026                  │              │
│  │ [Scheduled] [Online]         │              │
│  │                              │              │
│  │ Participants: 0              │              │
│  │ Registered: 5                │              │
│  └──────────────────────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**No Badge - Regular organizer creation**

---

## Scenario 2: Student Coordinator 🎓

### Login Flow:
```
Login → role = 'STUDENT_COORDINATOR'
Dashboard Title: "Student Coordinator Dashboard"
Create Button: ✅ VISIBLE
```

### Dashboard View:
```
┌─────────────────────────────────────────────────┐
│  Student Coordinator Dashboard        [+ Create]│
│  Manage your hackathons                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Scheduled Hackathons                           │
│  ┌──────────────────────────────┐              │
│  │ Campus Coding Marathon       │              │
│  │ Feb 15, 2026                 │              │
│  │ [Scheduled] [Offline]        │              │
│  │                              │              │
│  │ 👤 Created by Student        │ ← Purple Badge│
│  │    Coordinator               │              │
│  │                              │              │
│  │ Participants: 0              │              │
│  │ Registered: 12               │              │
│  └──────────────────────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Purple Badge - Shows Student Coordinator created it**

---

## Scenario 3: Regular Student 🚫

### Login Flow:
```
Login → role = 'student'
Dashboard Title: "Student Dashboard"
Create Button: ❌ HIDDEN
```

### Dashboard View:
```
┌─────────────────────────────────────────────────┐
│  Student Dashboard                  [NO BUTTON] │
│  View available hackathons                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Available Hackathons                           │
│  ┌──────────────────────────────┐              │
│  │ AI Innovation Challenge      │              │
│  │ Feb 1, 2026                  │              │
│  │ [Scheduled] [Online]         │              │
│  │                              │              │
│  │ Participants: 0              │              │
│  │ Registered: 5                │              │
│  │                              │              │
│  │ [View Details] [Register]    │              │
│  └──────────────────────────────┘              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Cannot Create - Can only view and register**

### If Student Tries to Access /create-hackathon Directly:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ⚠️  You are not authorized to create          │
│      hackathons                                 │
│                                                 │
│  Redirecting to student dashboard in 2s...     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔄 API Request/Response Examples

### 1. Organizer Creates Hackathon

**Request:**
```http
POST /api/hackathons
Authorization: Bearer eyJhbGc...  (role: ORGANIZER in token)
Content-Type: application/json

{
  "title": "AI Innovation Challenge",
  "description": "Build AI solutions",
  "mode": "online",
  "publish": true,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hackathon published successfully",
  "hackathon": {
    "_id": "...",
    "title": "AI Innovation Challenge",
    "createdBy": "user123",
    "createdByRole": "ORGANIZER",
    "status": "scheduled",
    ...
  }
}
```

---

### 2. Student Coordinator Creates Hackathon

**Request:**
```http
POST /api/hackathons
Authorization: Bearer eyJhbGc...  (role: STUDENT_COORDINATOR in token)
Content-Type: application/json

{
  "title": "Campus Coding Marathon",
  "description": "24-hour coding event",
  "mode": "offline",
  "publish": true,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hackathon published successfully",
  "hackathon": {
    "_id": "...",
    "title": "Campus Coding Marathon",
    "createdBy": "user456",
    "createdByRole": "STUDENT_COORDINATOR",  ← Tracked in DB
    "status": "scheduled",
    ...
  }
}
```

---

### 3. Student Attempts to Create (BLOCKED)

**Request:**
```http
POST /api/hackathons
Authorization: Bearer eyJhbGc...  (role: student in token)
Content-Type: application/json

{
  "title": "Unauthorized Hackathon",
  ...
}
```

**Response:**
```json
{
  "success": false,
  "message": "You are not authorized to create hackathons. Only Organizers and Student Coordinators can create hackathons."
}
```

**HTTP Status:** `403 Forbidden`

---

## 🎨 Visual Badge Differences

### Hackathon Card - Organizer Created:
```
┌─────────────────────────────────┐
│ AI Innovation Challenge         │
│ Feb 1, 2026                     │
│ [Scheduled] [Online]            │
│                                 │
│ (No special badge)              │
│                                 │
│ Participants: 0                 │
│ Registered: 5                   │
│                                 │
│ [View Details] [Manage]         │
└─────────────────────────────────┘
```

### Hackathon Card - Student Coordinator Created:
```
┌─────────────────────────────────┐
│ Campus Coding Marathon          │
│ Feb 15, 2026                    │
│ [Scheduled] [Offline]           │
│                                 │
│ ┌──────────────────────────┐   │
│ │👤 Created by Student      │   │ ← Purple Badge
│ │   Coordinator             │   │
│ └──────────────────────────┘   │
│                                 │
│ Participants: 0                 │
│ Registered: 12                  │
│                                 │
│ [View Details] [Manage]         │
└─────────────────────────────────┘
```

---

## 🔐 Security Flow Diagram

```
                          User Logs In
                                │
                                ▼
                        JWT Token Generated
                        (includes user role)
                                │
                                ▼
                     ┌──────────┴──────────┐
                     │                     │
         role = 'ORGANIZER'    role = 'STUDENT_COORDINATOR'    role = 'student'
                     │                     │                           │
                     ▼                     ▼                           ▼
          Can Create Hackathons   Can Create Hackathons    CANNOT Create
          No Badge                Purple Badge              Blocked at API
                     │                     │                           │
                     └──────────┬──────────┘                           │
                                │                                      │
                                ▼                                      ▼
                    POST /api/hackathons                     403 Forbidden
                                │                           "Not authorized"
                                ▼
                    checkHackathonCreatorRole
                           Middleware
                                │
                                ▼
                    ┌───────────┴───────────┐
                    │                       │
            ✅ Allowed Role          ❌ Not Allowed
            (ORGANIZER/COORD)           (student)
                    │                       │
                    ▼                       ▼
            Create Hackathon          Return 403
            Save with role           "Not authorized"
                    │
                    ▼
            Success Response
```

---

## 📊 Database Structure

### User Document:
```javascript
{
  "_id": "user123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@college.edu",
  "role": "STUDENT_COORDINATOR",  // ← Role stored here
  "college": "Tech University",
  ...
}
```

### Hackathon Document:
```javascript
{
  "_id": "hack456",
  "title": "Campus Coding Marathon",
  "description": "24-hour coding event",
  "organizer": "user123",           // ← User ID who created
  "createdBy": "user123",           // ← Same as organizer
  "createdByRole": "STUDENT_COORDINATOR",  // ← Role at creation time
  "status": "scheduled",
  "startDate": "2026-02-15T10:00:00Z",
  ...
}
```

---

## 🎯 Key Takeaways

| Aspect | Student | Organizer | Student Coordinator |
|--------|---------|-----------|---------------------|
| **Can Create?** | ❌ No | ✅ Yes | ✅ Yes |
| **Badge Shown?** | N/A | ❌ No | ✅ Yes (Purple) |
| **Dashboard** | Student | Organizer | Coordinator |
| **Create Button** | ❌ Hidden | ✅ Visible | ✅ Visible |
| **API Access** | 🚫 Blocked (403) | ✅ Allowed | ✅ Allowed |
| **Role in DB** | `student` | `ORGANIZER` | `STUDENT_COORDINATOR` |

---

## ✅ Implementation Summary

1. **Backend Protection** 🛡️
   - JWT middleware validates authentication
   - `checkHackathonCreatorRole` validates role
   - Database tracks creator role

2. **Frontend Visibility** 👁️
   - Create button hidden for students
   - Dashboard title changes by role
   - Purple badge for coordinator creations

3. **Clear Feedback** 💬
   - Error messages for unauthorized access
   - Automatic redirects for blocked users
   - Visual distinction between creator types

4. **Secure & Scalable** 🚀
   - Easy to add new roles
   - Consistent permissions
   - Proper audit trail

---

**Ready for Production! 🎉**
