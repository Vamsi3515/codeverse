# DELETE HACKATHON - FLOW DIAGRAMS & ARCHITECTURE

---

## 🔄 USER INTERACTION FLOW

```
ORGANIZER DASHBOARD
├─ View Scheduled Hackathons
│  ├─ Hackathon Card 1
│  │  ├─ Title: "Web Dev Challenge"
│  │  ├─ Status: Scheduled ✅ (can delete)
│  │  ├─ Manage Button
│  │  └─ Delete Button (RED) ← CLICK HERE
│  │
│  ├─ Hackathon Card 2
│  │  ├─ Title: "Active Hackathon"
│  │  ├─ Status: Active ❌ (cannot delete)
│  │  └─ No Delete Button
│  │
│  └─ Hackathon Card 3
│     ├─ Title: "Draft Hackathon"
│     ├─ Status: Draft ✅ (can delete)
│     └─ Delete Button (RED)

CLICK DELETE BUTTON
    ↓
CONFIRMATION MODAL APPEARS
├─ Title: "Delete Hackathon?"
├─ Message: "Are you sure you want to delete Web Dev Challenge?"
└─ Buttons:
   ├─ Cancel (cancel deletion)
   └─ Delete (confirm deletion)

IF CANCEL
    ↓
Modal closes, hackathon remains

IF DELETE (CONFIRM)
    ↓
Button shows "Deleting..." (disabled)
    ↓
API Call: DELETE /api/hackathons/507f1f77bcf86cd799439011
    ↓
BACKEND PROCESSING:
  ✅ Token validated
  ✅ User found
  ✅ Hackathon exists
  ✅ User owns hackathon
  ✅ Status is "scheduled"
  ✅ Delete from database
    ↓
RESPONSE: 200 OK { success: true }
    ↓
FRONTEND:
  ✅ Remove hackathon from scheduledHackathons state
  ✅ Modal closes
  ✅ Success toast appears: "Hackathon deleted successfully"
  ✅ Card disappears from UI
  ✅ Toast auto-hides after 3 seconds

RESULT:
✅ Hackathon gone from database
✅ Hackathon gone from UI
✅ No page refresh
✅ User confirmed
```

---

## 🏗️ BACKEND ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND REQUEST                          │
│  DELETE /api/hackathons/507f1f77bcf86cd799439011             │
│  Headers: { Authorization: Bearer eyJh... }                  │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         MIDDLEWARE: protect()                                │
│  ├─ Extract JWT from Authorization header                    │
│  ├─ Verify JWT signature with JWT_SECRET                     │
│  ├─ Find user in:                                            │
│  │  ├─ Organizer collection  ← First
│  │  ├─ Student collection    ← Second (exception email)
│  │  └─ User collection       ← Third (legacy)
│  ├─ Set req.user with found user data                        │
│  └─ Pass to controller
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│      CONTROLLER: deleteHackathon(req, res)                   │
│                                                              │
│  1. Extract hackathonId from req.params                      │
│     └─ hackathonId = "507f1f77bcf86cd799439011"             │
│                                                              │
│  2. Log request info                                         │
│     └─ console.log("Delete request:", hackathonId)           │
│                                                              │
│  3. Find hackathon in database                               │
│     ├─ Hackathon.findById(id)                                │
│     └─ If NOT found → Return 404 {success: false}            │
│                                                              │
│  4. Check ownership                                          │
│     ├─ hackathon.organizer.toString()                        │
│     ├─ req.user.id.toString()                                │
│     ├─ Compare ObjectIds                                     │
│     └─ If NOT match → Return 403 {success: false}            │
│                                                              │
│  5. Check status                                             │
│     ├─ Must be "scheduled" or "draft"                        │
│     ├─ If "active" or "completed"                            │
│     └─ → Return 400 {success: false}                         │
│                                                              │
│  6. Delete from database                                     │
│     ├─ Hackathon.findByIdAndDelete(id)                       │
│     └─ console.log("✅ Deleted:", hackathon.title)           │
│                                                              │
│  7. Return success response                                  │
│     └─ { success: true, hackathon: {...} }                   │
│                                                              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                 RESPONSE TO FRONTEND                         │
│  Status: 200 OK                                              │
│  Body: {                                                     │
│    "success": true,                                          │
│    "message": "Hackathon deleted successfully",              │
│    "hackathon": {                                            │
│      "id": "507f1f77bcf86cd799439011",                       │
│      "title": "Web Dev Challenge"                            │
│    }                                                         │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            FRONTEND UPDATES (OrganizerDashboard)             │
│                                                              │
│  1. Check response.ok (true for 200)                         │
│                                                              │
│  2. Call onDelete callback                                   │
│     └─ Pass hackathonId to parent component                  │
│                                                              │
│  3. Update component state                                   │
│     ├─ setScheduledHackathons(prev =>                        │
│     │   prev.filter(h => h.id !== hackathonId)               │
│     ├─ setActiveHackathons(prev =>                           │
│     │   prev.filter(h => h.id !== hackathonId))              │
│     └─ setPreviousHackathons(prev =>                         │
│         prev.filter(h => h.id !== hackathonId))              │
│                                                              │
│  4. Show success toast                                       │
│     └─ setDeleteToast("Hackathon deleted successfully")      │
│                                                              │
│  5. Clear modal                                              │
│     └─ setShowConfirmDelete(false)                           │
│                                                              │
│  6. UI automatically re-renders                              │
│     └─ Card component unmounts (no longer in state array)    │
│                                                              │
│  7. Toast auto-hides after 3 seconds                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 SECURITY FLOW

```
DELETE REQUEST ARRIVES
         ↓
STEP 1: AUTHENTICATION
┌──────────────────────────────────────┐
│ Check if token exists                 │
│ ├─ No token? → 401 Unauthorized      │
│ ├─ Invalid token? → 401 Unauthorized │
│ └─ Valid token? → Continue            │
└────────────────┬─────────────────────┘
                 ↓
STEP 2: USER LOOKUP
┌──────────────────────────────────────┐
│ Find user by token's user_id          │
│ ├─ Not found? → 404 User not found    │
│ └─ Found? → Continue                  │
│    └─ req.user = { id, email, role }  │
└────────────────┬─────────────────────┘
                 ↓
STEP 3: HACKATHON LOOKUP
┌──────────────────────────────────────┐
│ Find hackathon by hackathonId          │
│ ├─ Not found? → 404 Hackathon not found
│ └─ Found? → Continue                  │
└────────────────┬─────────────────────┘
                 ↓
STEP 4: OWNERSHIP VERIFICATION
┌──────────────────────────────────────┐
│ Compare organizer IDs                 │
│ ├─ hackathon.organizer.toString()    │
│ ├─ req.user.id.toString()             │
│ ├─ Match? → Continue                  │
│ └─ No match? → 403 Forbidden          │
│    (Not authorized to delete)         │
└────────────────┬─────────────────────┘
                 ↓
STEP 5: STATUS VALIDATION
┌──────────────────────────────────────┐
│ Check hackathon.status                 │
│ ├─ "scheduled"? → Continue             │
│ ├─ "draft"? → Continue                 │
│ ├─ "active"? → 400 Cannot delete      │
│ ├─ "completed"? → 400 Cannot delete   │
│ └─ Reason: Protect user data          │
└────────────────┬─────────────────────┘
                 ↓
STEP 6: DELETE
┌──────────────────────────────────────┐
│ All checks passed!                    │
│ ├─ Delete hackathon from database     │
│ └─ Return 200 OK                      │
└──────────────────────────────────────┘
```

---

## ⚠️ ERROR SCENARIOS

```
SCENARIO 1: No Token
┌─ Request: DELETE /api/hackathons/123
├─ Headers: { } (no Authorization header)
├─ Response: 401 Unauthorized
└─ Body: "Not authorized to access this route"

SCENARIO 2: Invalid Token
┌─ Request: DELETE /api/hackathons/123
├─ Headers: { Authorization: "Bearer invalid_token" }
├─ Response: 401 Unauthorized
└─ Body: "Not authorized to access this route"

SCENARIO 3: Hackathon Not Found
┌─ Request: DELETE /api/hackathons/000000000000000000000000
├─ Token: Valid ✓
├─ Response: 404 Not Found
└─ Body: "Hackathon not found"

SCENARIO 4: Different Organizer
┌─ Request: DELETE /api/hackathons/507f1f77bcf86cd799439011
├─ Token: Organizer B (who didn't create it)
├─ Hackathon: Created by Organizer A
├─ Response: 403 Forbidden
└─ Body: "Not authorized to delete this hackathon"

SCENARIO 5: Active Hackathon
┌─ Request: DELETE /api/hackathons/507f1f77bcf86cd799439011
├─ Token: Valid ✓ (owner)
├─ Hackathon: Status = "active"
├─ Response: 400 Bad Request
└─ Body: "Cannot delete active hackathon. Only scheduled or draft can be deleted."

SCENARIO 6: Success
┌─ Request: DELETE /api/hackathons/507f1f77bcf86cd799439011
├─ Token: Valid ✓ (owner)
├─ Hackathon: Status = "scheduled"
├─ Response: 200 OK
└─ Body: {
    "success": true,
    "message": "Hackathon deleted successfully",
    "hackathon": { ... }
  }
```

---

## 🎯 COMPONENT HIERARCHY

```
OrganizerDashboard
├─ State:
│  ├─ scheduledHackathons: [ { id, title, status, ... } ]
│  ├─ activeHackathons: [ ... ]
│  ├─ previousHackathons: [ ... ]
│  └─ deleteToast: string
│
├─ Function:
│  └─ handleHackathonDelete(hackathonId)
│     ├─ Filter hackathon from all state arrays
│     └─ Show success toast
│
└─ Render:
   ├─ Scheduled Hackathons Section
   │  └─ {scheduledHackathons.map(h =>
   │     <OrganizerHackathonCard
   │       id={h.id}
   │       title={h.title}
   │       status="Scheduled"
   │       onDelete={handleHackathonDelete}
   │     />
   │  )}
   │
   ├─ Active Hackathons Section
   │  └─ {activeHackathons.map(h => ...)}
   │
   └─ Previous Hackathons Section
      └─ {previousHackathons.map(h => ...)}

OrganizerHackathonCard
├─ Props:
│  ├─ id: string (hackathonId)
│  ├─ title: string
│  ├─ status: string ("Scheduled", "Active", "Completed")
│  └─ onDelete: function(hackathonId)
│
├─ State:
│  ├─ showConfirmDelete: boolean
│  ├─ deleting: boolean
│  └─ error: string
│
├─ Handlers:
│  ├─ handleDeleteClick() → setShowConfirmDelete(true)
│  ├─ handleConfirmDelete() → DELETE API call
│  └─ handleCancelDelete() → setShowConfirmDelete(false)
│
└─ Render:
   ├─ Card UI
   │  ├─ Hackathon title, date, status
   │  ├─ Manage button
   │  └─ Delete button (conditional)
   │     └─ Only if status === "Scheduled"
   │
   └─ Confirmation Modal (if showConfirmDelete)
      ├─ Warning message
      ├─ Cancel button
      └─ Delete button (shows "Deleting..." during request)
```

---

## 📊 STATE TRANSITIONS

```
BEFORE DELETE
┌─────────────────────────────────────┐
│ scheduledHackathons = [             │
│   { id: 1, title: "Hackathon A" },  │
│   { id: 2, title: "Hackathon B" }   │
│ ]                                   │
│                                     │
│ showConfirmDelete = false            │
│ deleting = false                     │
│ deleteToast = ""                     │
└─────────────────────────────────────┘

USER CLICKS DELETE
         ↓
┌─────────────────────────────────────┐
│ showConfirmDelete = true             │ ← Modal appears
│ Modal: "Delete Hackathon A?"         │
└─────────────────────────────────────┘

USER CONFIRMS DELETE
         ↓
┌─────────────────────────────────────┐
│ deleting = true                      │ ← Button disabled
│ Button text: "Deleting..."           │
└─────────────────────────────────────┘

API CALL COMPLETES
         ↓
┌─────────────────────────────────────┐
│ onDelete(1) called by OrganizerHackathonCard
│                                     │
│ Parent (OrganizerDashboard):        │
│ scheduledHackathons = [             │
│   { id: 2, title: "Hackathon B" }   │ ← Item removed
│ ]                                   │
│                                     │
│ showConfirmDelete = false            │ ← Modal closes
│ deleting = false                     │
│ deleteToast = "Hackathon deleted..." │ ← Toast shows
└─────────────────────────────────────┘

AFTER 3 SECONDS
         ↓
┌─────────────────────────────────────┐
│ deleteToast = ""                     │ ← Toast hides
│                                     │
│ Final state: Only Hackathon B shown  │
└─────────────────────────────────────┘
```

---

## 📝 CONSOLE LOGS

```
USER CLICKS DELETE
🔍 Delete request for hackathon ID: 507f1f77bcf86cd799439011
📍 Requester ID: 69664dc65cec2fc5bd6e310c Email: 22b61a0557@sitam.co.in

✅ Hackathon found: Web Dev Challenge Status: scheduled
   Hackathon Organizer ID: 69664dc65cec2fc5bd6e310c
   Requester ID: 69664dc65cec2fc5bd6e310c

✅ Hackathon deleted successfully: Web Dev Challenge

---

IF ERROR (Different organizer):
❌ Permission denied: Organizer mismatch
Response: 403 Forbidden

---

IF ERROR (Active hackathon):
Response: 400 Bad Request
Message: Cannot delete active hackathon. Only scheduled or draft can be deleted.
```

---

**Architecture documented! Now ready for deployment! 🚀**
