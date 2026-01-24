# Organizer to Student Flow - Testing Guide

## ✅ Implementation Complete

### What Was Implemented:

#### 1️⃣ **Backend Changes**

**Models (`backend/src/models/Hackathon.js`):**
- ✅ Added `isPublished` field (Boolean, default: false)
- ✅ Set to `true` when hackathon is published

**Controllers (`backend/src/controllers/hackathonController.js`):**
- ✅ Updated `createHackathon` to set `isPublished = true` when `publish = true`
- ✅ Created new `getAvailableHackathons` endpoint for students
  - Filters: `isPublished = true` AND `status != 'completed'`
  - Sorts by `startDate` ascending
  - Auto-calculates display status (Upcoming/Active/Completed)
- ✅ Updated `getAllHackathons` to filter by `isPublished = true`

**Routes (`backend/src/routes/hackathonRoutes.js`):**
- ✅ Added route: `GET /api/hackathons/available` (public)

#### 2️⃣ **Frontend Changes**

**Student Dashboard (`frontend/src/pages/StudentDashboard.jsx`):**
- ✅ Changed API endpoint from `/api/hackathons` to `/api/hackathons/available`
- ✅ Added data transformation to match UI format
- ✅ Added loading state with spinner
- ✅ Added empty state with icon and message
- ✅ Proper mode/status badge display
- ✅ Uses API hackathons instead of static data

---

## 🧪 Testing Steps

### **Step 1: Create and Publish Hackathon (Organizer)**

1. **Login as Organizer**
   ```
   URL: http://localhost:5173/login/organizer
   Email: organizer@college.edu
   Password: [your password]
   ```

2. **Navigate to Create Hackathon**
   - Click "Create Hackathon" button
   - Or go to: `http://localhost:5173/create-hackathon`

3. **Fill Hackathon Details**
   ```
   Title: "Spring 2026 Innovation Challenge"
   Description: "Build innovative solutions"
   Mode: Online
   Participation Type: Team
   Min Team Size: 2
   Max Team Size: 4
   
   Start Date: [Today + 5 days]
   End Date: [Today + 7 days]
   ```

4. **Publish**
   - Click "Publish Hackathon" button
   - ✅ Should see success message
   - ✅ Redirected to organizer dashboard
   - ✅ Hackathon appears under "Scheduled Hackathons"

5. **Verify in Database (Optional)**
   ```javascript
   // In MongoDB
   db.hackathons.findOne({ title: "Spring 2026 Innovation Challenge" })
   
   // Should see:
   {
     status: "scheduled",
     isPublished: true,
     ...
   }
   ```

---

### **Step 2: View in Student Dashboard**

1. **Open Student Dashboard** (in new tab/window or logout and login as student)
   ```
   URL: http://localhost:5173/login/student
   Email: student@college.edu
   Password: [your password]
   ```

2. **Check Available Hackathons Section**
   - Should see "Available Hackathons" section
   - ✅ "Spring 2026 Innovation Challenge" should appear
   - ✅ Shows college name
   - ✅ Shows "Online" badge (blue)
   - ✅ Shows "Upcoming" badge (yellow)

3. **Verify Details on Card**
   ```
   ✅ Hackathon title displayed
   ✅ Organizer college shown
   ✅ Start date formatted correctly
   ✅ Mode badge: "Online" (blue) or "Offline" (orange)
   ✅ Status badge: "Upcoming" (yellow)
   ✅ "Register" button visible
   ```

---

### **Step 3: Real-Time Update Test**

1. **Keep Student Dashboard Open**

2. **In Another Tab: Create Another Hackathon (Organizer)**
   ```
   Title: "AI/ML Hackathon 2026"
   Mode: Offline
   [Fill other details]
   ```

3. **Publish It**

4. **Return to Student Dashboard**
   - Refresh the page (F5)
   - ✅ New hackathon "AI/ML Hackathon 2026" should appear
   - ✅ Shows "Offline" badge (orange)

---

### **Step 4: Filter Tests**

**Test Online Filter:**
1. In student dashboard, click "Online" tab
2. ✅ Only online hackathons shown
3. ✅ Offline hackathons hidden

**Test Near Me Filter:**
1. Click "Near Me" tab
2. ✅ Only offline hackathons shown
3. ✅ Online hackathons hidden

**Test Search:**
1. Type "Innovation" in search box
2. ✅ Only matching hackathons shown

---

### **Step 5: Empty State Test**

**Method 1: Delete All Published Hackathons (Database)**
```javascript
// In MongoDB
db.hackathons.updateMany(
  { isPublished: true },
  { $set: { isPublished: false } }
)
```

**Method 2: Filter with No Results**
1. Search for "XYZ Nonexistent"
2. ✅ Should see empty state:
   - Icon displayed
   - Message: "No hackathons available"
   - Subtext: "No hackathons available right now. Please check back later."

---

### **Step 6: Status Display Test**

**Create Hackathons with Different Dates:**

1. **Active Hackathon**
   ```
   Start Date: [Yesterday]
   End Date: [Tomorrow]
   Expected Badge: "Active" (green)
   ```

2. **Upcoming Hackathon**
   ```
   Start Date: [Tomorrow]
   End Date: [Tomorrow + 2 days]
   Expected Badge: "Upcoming" (yellow)
   ```

3. **Completed Hackathon**
   ```
   Start Date: [5 days ago]
   End Date: [3 days ago]
   Expected: Should NOT appear (filtered out)
   ```

---

## 📊 Expected Results

### Organizer Dashboard:
- ✅ Published hackathons appear under "Scheduled Hackathons"
- ✅ Draft hackathons do NOT show to students
- ✅ Can view registrations
- ✅ Can delete hackathons

### Student Dashboard:
- ✅ Only published hackathons appear
- ✅ Completed hackathons are hidden
- ✅ Correct status badges:
  - 🟡 Upcoming (before start date)
  - 🟢 Active (between start and end date)
  - ⚫ Completed (after end date - not shown)
- ✅ Correct mode badges:
  - 🔵 Online
  - 🟠 Offline
- ✅ Loading spinner during fetch
- ✅ Empty state when no hackathons
- ✅ Filters work correctly

---

## 🔍 Verification Checklist

**Backend:**
- [ ] `isPublished` field exists in Hackathon model
- [ ] Published hackathons have `isPublished: true`
- [ ] Draft hackathons have `isPublished: false`
- [ ] `/api/hackathons/available` endpoint works
- [ ] Returns only published, non-completed hackathons
- [ ] Status auto-calculated correctly

**Frontend:**
- [ ] Fetches from `/api/hackathons/available`
- [ ] Loading state shows spinner
- [ ] Empty state shows message
- [ ] Hackathon cards display correctly
- [ ] Mode badges colored properly (blue/orange)
- [ ] Status badges colored properly (yellow/green)
- [ ] Register button appears on each card
- [ ] Filters work (Online, Near Me, Search)

**Flow:**
- [ ] Organizer creates hackathon
- [ ] Click publish → saved to DB
- [ ] Student refreshes → hackathon appears
- [ ] Student can click register
- [ ] Multiple hackathons show correctly

---

## 🐛 Troubleshooting

### Hackathon Not Appearing in Student Dashboard:

**Check 1: Is it published?**
```javascript
// MongoDB
db.hackathons.findOne({ title: "Your Hackathon" })
// Check: isPublished: true
```

**Check 2: Check status**
```javascript
// Should NOT be 'completed'
```

**Check 3: Backend logs**
```bash
# In backend terminal
# Should see: GET /api/hackathons/available
```

**Check 4: Browser console**
```javascript
// Open DevTools → Console
// Check for fetch errors
```

### Empty State Always Showing:

**Check 1: API response**
```javascript
// In browser console
fetch('http://localhost:5000/api/hackathons/available')
  .then(r => r.json())
  .then(console.log)
```

**Check 2: Network tab**
```
DevTools → Network → Filter: available
Check response status and data
```

### Status Badge Wrong:

**Issue:** Shows "Upcoming" when should be "Active"

**Solution:** Check dates in database
```javascript
// Dates should be in ISO format
startDate: "2026-01-18T10:00:00.000Z"
endDate: "2026-01-20T18:00:00.000Z"
```

---

## 📝 API Endpoints

### Get Available Hackathons (Public)
```
GET /api/hackathons/available

Response:
{
  "success": true,
  "count": 2,
  "hackathons": [
    {
      "_id": "...",
      "title": "Spring Innovation Challenge",
      "college": "State University",
      "mode": "online",
      "participationType": "TEAM",
      "startDate": "2026-01-25T10:00:00.000Z",
      "endDate": "2026-01-27T18:00:00.000Z",
      "status": "scheduled",
      "displayStatus": "Upcoming",
      "registeredCount": 0,
      "maxParticipants": 100,
      "minTeamSize": 2,
      "maxTeamSize": 4
    }
  ]
}
```

---

## ✅ Success Criteria

Test passes when:
1. ✅ Organizer can create and publish hackathon
2. ✅ Published hackathon saves with `isPublished: true`
3. ✅ Student dashboard fetches from `/api/hackathons/available`
4. ✅ Hackathon appears immediately after page refresh
5. ✅ Correct badges display (mode and status)
6. ✅ Empty state shows when no hackathons
7. ✅ Loading state shows during fetch
8. ✅ Filters work correctly
9. ✅ Register button clickable and opens team modal

---

**Last Updated:** January 19, 2026  
**Status:** ✅ Ready for Testing
