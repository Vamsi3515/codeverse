# maxParticipants Validation - Testing Guide

## 🎯 What Was Fixed

Online hackathons now work without maxParticipants field, while offline hackathons still require it for venue capacity management.

---

## ✅ How to Test

### Test 1: Create Online Solo Hackathon (Should PASS ✅)

```bash
# Steps:
1. Open Create Hackathon form
2. Fill basic details:
   - Title: "Online Solo Challenge"
   - Description: "A solo programming challenge"
3. Select Mode: "ONLINE"
4. Select Participation: "SOLO"
5. Add at least 1 problem statement
6. Click Publish

Expected Result: ✅ SUCCESS
- Hackathon created and published
- No "maxParticipants is required" error
```

---

### Test 2: Create Online Team Hackathon (Should PASS ✅)

```bash
# Steps:
1. Open Create Hackathon form
2. Fill basic details:
   - Title: "Online Team Challenge"
   - Description: "A team-based online hackathon"
3. Select Mode: "ONLINE"
4. Select Participation: "TEAM"
5. Add at least 1 problem statement
6. Click Publish

Expected Result: ✅ SUCCESS
- Hackathon created and published
- No validation errors
- Works even without specifying max team limit
```

---

### Test 3: Create Offline Hackathon (Should PASS ✅)

```bash
# Steps:
1. Open Create Hackathon form
2. Fill basic details:
   - Title: "Offline Hackathon"
   - Description: "Physical event at college venue"
3. Select Mode: "OFFLINE"
4. Fill Location:
   - Venue Name: "Tech Building"
   - Address: "College Street, City"
   - City: "City Name"
   - Latitude: 28.7041
   - Longitude: 77.1025
5. Set Participation Type and other details
6. Click Publish

Expected Result: ✅ SUCCESS
- Hackathon created with venue location
- maxParticipants = 100 (from frontend)
- Backend validates capacity is set
```

---

## 📊 Behind the Scenes

### Frontend Logic
```javascript
// File: frontend/.../CreateHackathon.jsx

const hackathonData = {
  mode: 'online',  // or 'offline' or 'hybrid'
  // ...
  // Conditional field - only for offline/hybrid:
  ...(mode === 'offline' || mode === 'hybrid' ? { maxParticipants: 100 } : {}),
  // ...
}

// For ONLINE: maxParticipants field is NOT included in payload
// For OFFLINE/HYBRID: maxParticipants: 100 is included
```

### Backend Logic
```javascript
// File: backend/.../Hackathon.js (Schema)

maxParticipants: {
  type: Number,
  required: function () {
    // Only required if offline/hybrid
    return this.mode === 'offline' || this.mode === 'hybrid';
  },
  validate: {
    validator: function(v) {
      if (this.mode === 'online') {
        return true;  // ✅ Allow undefined for online
      }
      return v && v > 0;  // ✅ Require positive for offline
    }
  }
}

// For ONLINE: maxParticipants is optional (can be undefined)
// For OFFLINE: maxParticipants is required and must be > 0
```

---

## 🔍 What Changed

### Before Fix ❌
```
ONLINE Hackathon Creation:
- Frontend always sends: maxParticipants: 100
- Backend schema: required: true (always)
- Result: ❌ Validation error (unexpected)

OFFLINE Hackathon Creation:
- Frontend sends: maxParticipants: 100
- Backend schema: required: true
- Result: ✅ Works (but for wrong reason)
```

### After Fix ✅
```
ONLINE Hackathon Creation:
- Frontend sends: (no maxParticipants field)
- Backend schema: required if mode === offline
- Result: ✅ Works! (no unnecessary validation)

OFFLINE Hackathon Creation:
- Frontend sends: maxParticipants: 100
- Backend schema: required if mode === offline
- Result: ✅ Works! (validates properly)
```

---

## 🧪 Edge Cases

### Edge Case 1: Manually send maxParticipants for online hackathon
```
API Request (manual/test):
POST /api/hackathons
{
  mode: 'online',
  maxParticipants: 100,
  ...
}

Result: ✅ Still works!
- Backend allows it (validator returns true for online)
- It's just not required
- Good for flexibility
```

### Edge Case 2: Don't send maxParticipants for offline hackathon
```
API Request (manual/test):
POST /api/hackathons
{
  mode: 'offline',
  location: { ... },
  // No maxParticipants
  ...
}

Result: ❌ Fails with error
- Backend requires it (required: function returns true)
- Error message: "maxParticipants is required"
- Good for data integrity
```

### Edge Case 3: Send maxParticipants as 0 for offline
```
API Request (manual/test):
POST /api/hackathons
{
  mode: 'offline',
  maxParticipants: 0,
  location: { ... },
  ...
}

Result: ❌ Fails with validation error
- Backend validates: v > 0
- Error: "maxParticipants must be > 0"
- Good for preventing invalid capacity
```

---

## 📋 Validation Rules Summary

| Field | ONLINE | OFFLINE | HYBRID |
|-------|--------|---------|--------|
| maxParticipants | Optional | **Required** | **Required** |
| Default | undefined | 100 | 100 |
| Min Value | N/A | > 0 | > 0 |
| Validation | None | Positive number | Positive number |

---

## 🚀 Quick Verification

**Test command** (if using API tools like Postman/cURL):

```bash
# Test 1: Online hackathon (should succeed)
curl -X POST http://localhost:5000/api/hackathons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Online Test",
    "mode": "online",
    "description": "...",
    "startDate": "2025-02-01T10:00:00Z",
    "endDate": "2025-02-02T10:00:00Z",
    "problemStatements": [...]
  }'
# Expected: ✅ 201 Created

# Test 2: Offline hackathon (should succeed)
curl -X POST http://localhost:5000/api/hackathons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Offline Test",
    "mode": "offline",
    "maxParticipants": 100,
    "description": "...",
    "location": {...},
    "startDate": "2025-02-01T10:00:00Z",
    "endDate": "2025-02-02T10:00:00Z"
  }'
# Expected: ✅ 201 Created

# Test 3: Offline without maxParticipants (should fail)
curl -X POST http://localhost:5000/api/hackathons \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Offline Test",
    "mode": "offline",
    "description": "...",
    "location": {...},
    "startDate": "2025-02-01T10:00:00Z",
    "endDate": "2025-02-02T10:00:00Z"
  }'
# Expected: ❌ 400 Validation Error
# Message: "maxParticipants is required"
```

---

## ✨ Result Summary

✅ **Online Hackathons**: No maxParticipants needed, unlimited participants  
✅ **Offline Hackathons**: maxParticipants required, enforces venue capacity  
✅ **Hybrid Hackathons**: maxParticipants required (physical venue attendance)  
✅ **Validation**: Clear error messages guide users  
✅ **API**: Properly handles conditional fields  
✅ **Backward Compatible**: Existing offline hackathons unaffected  

---

## 📞 Troubleshooting

**Q: Still getting "maxParticipants is required" for online hackathon?**
- A: Clear browser cache and restart the development server
- Run: `npm run dev` in both frontend and backend folders

**Q: Offline hackathon won't save?**
- A: Make sure you have:
  1. Set mode to "OFFLINE"
  2. Filled location details (venue, address, city, coordinates)
  3. Selected valid participation type
  4. Frontend will auto-set maxParticipants to 100

**Q: Can I manually set maxParticipants for online hackathon?**
- A: Yes! It's optional, so you can include it if needed for analytics. The validator allows it.

**Q: Where is maxParticipants used?**
- A: Registration tracking and capacity management (mainly for offline events)
- Online events can have unlimited participants (field optional)

---

## 🎉 You're All Set!

The validation logic is now **mode-aware and intelligent**. Online hackathons are lightweight, offline events have proper capacity management. Perfect! 🚀
