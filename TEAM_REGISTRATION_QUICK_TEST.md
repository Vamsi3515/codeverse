# Team Registration Flow - Quick Test Guide

## 🚀 Quick Start

### Prerequisites
- MongoDB running
- Backend server started: `cd backend && npm start`
- Frontend server started: `cd frontend/codeverse-campus && npm run dev`

---

## 📝 Test Flow

### Step 1: Create Team-Based Hackathon (Organizer)

1. **Login as Organizer**
   - Navigate to: `http://localhost:5173/login/organizer`
   - Use existing organizer credentials

2. **Create Hackathon**
   - Click "Create Hackathon" button
   - Fill in basic details:
     - Title: "Team Innovation Challenge"
     - Description: "A collaborative hackathon"
     - Mode: Online/Offline
     - Participation Type: **Team** ⬅️ Important!
   
3. **Configure Team Settings**
   - Min Team Size: 2
   - Max Team Size: 4
   - Set dates and other fields
   - Click "Publish Hackathon"

4. **Verify Creation**
   - ✅ Should see success message
   - ✅ Hackathon appears in organizer dashboard

---

### Step 2: Register as Team (Student)

1. **Login as Student**
   - Navigate to: `http://localhost:5173/login/student`
   - Use existing student credentials

2. **Find Team Hackathon**
   - View student dashboard
   - Look for "Team Innovation Challenge" (or your hackathon)

3. **Click Register**
   - Registration modal should open
   - ✅ Verify "Team Requirements" section is visible
   - ✅ Verify team leader info is auto-filled

4. **Fill Team Details**
   ```
   Team Name: "Code Warriors"
   Team Size: 3 (from dropdown)
   
   Member 1:
   - Email: student2@college.edu
   - Roll Number: CS21001
   
   Member 2:
   - Email: student3@college.edu
   - Roll Number: CS21002
   ```

5. **Submit Registration**
   - Click "Register" button
   - ✅ Should see success message
   - ✅ Button changes to "✔ Registered"

---

### Step 3: View Team Registrations (Organizer)

1. **Go to Organizer Dashboard**
   - Navigate to: `http://localhost:5173/dashboard/organizer`

2. **Click "View Registrations"**
   - On the team hackathon card
   - Should navigate to registrations page

3. **Verify Team Display**
   - ✅ See "Registered Teams" section
   - ✅ Team name: "Code Warriors"
   - ✅ Team Leader details visible
   - ✅ 2 team members listed
   - ✅ Total team size: 3 members
   - ✅ All member statuses: CONFIRMED

---

## 🧪 Validation Tests

### Test 1: Duplicate Email
1. Try registering with leader's email as team member
2. ✅ Should show error: "Duplicate emails found in team"

### Test 2: Missing Team Name
1. Leave team name empty
2. Click Register
3. ✅ Should show error: "Team name is required"

### Test 3: Incomplete Member Info
1. Fill member email but not roll number
2. Click Register
3. ✅ Should show error: "Please fill in all details for team member X"

### Test 4: Already Registered
1. Register for a hackathon
2. Try registering again
3. ✅ Should show error: "Already registered for this hackathon"

---

## 🎯 Expected Results

### Database (MongoDB)

**Hackathon Document:**
```json
{
  "title": "Team Innovation Challenge",
  "participationType": "TEAM",
  "minTeamSize": 2,
  "maxTeamSize": 4,
  ...
}
```

**Registration Document:**
```json
{
  "hackathonId": "...",
  "userId": "...",
  "participationType": "TEAM",
  "team": {
    "teamName": "Code Warriors",
    "leader": {
      "studentId": "...",
      "email": "student1@college.edu",
      "rollNumber": "CS21000"
    },
    "members": [
      {
        "email": "student2@college.edu",
        "rollNumber": "CS21001",
        "status": "CONFIRMED"
      },
      {
        "email": "student3@college.edu",
        "rollNumber": "CS21002",
        "status": "CONFIRMED"
      }
    ]
  },
  "status": "registered",
  ...
}
```

---

## 🔍 Verification Checklist

### Organizer Side:
- [ ] Can select Team participation type
- [ ] Team size fields appear when Team is selected
- [ ] Can set min and max team size
- [ ] Hackathon is created successfully
- [ ] Can view "View Registrations" button
- [ ] Team details page shows all teams
- [ ] Team members are listed correctly

### Student Side:
- [ ] Registration modal opens
- [ ] Team section appears for team hackathons
- [ ] Leader info is auto-filled
- [ ] Team size dropdown works
- [ ] Member inputs appear dynamically
- [ ] Validation errors show correctly
- [ ] Registration succeeds
- [ ] "Registered" status is shown

---

## 🐛 Troubleshooting

### Modal doesn't open:
- Check browser console for errors
- Verify hackathon object has `participationType` field
- Ensure TeamRegistrationModal is imported

### Backend validation errors:
- Check backend console logs
- Verify token is being sent in Authorization header
- Check MongoDB connection

### Fields not showing:
- Verify participationType is uppercase ('TEAM' not 'team')
- Check hackathon object structure
- Clear browser cache and reload

---

## 📊 API Endpoints to Test

### Create Hackathon:
```
POST http://localhost:5000/api/hackathons
Authorization: Bearer <token>

Body:
{
  "title": "Team Innovation Challenge",
  "participationType": "TEAM",
  "minTeamSize": 2,
  "maxTeamSize": 4,
  ...
}
```

### Register for Hackathon:
```
POST http://localhost:5000/api/registrations
Authorization: Bearer <token>

Body:
{
  "hackathonId": "...",
  "teamData": {
    "teamName": "Code Warriors",
    "leaderRollNumber": "CS21000",
    "members": [
      {
        "email": "student2@college.edu",
        "rollNumber": "CS21001"
      }
    ]
  }
}
```

### View Registrations:
```
GET http://localhost:5000/api/registrations/hackathon/:hackathonId
Authorization: Bearer <token>
```

---

## ✅ Success Criteria

Test is successful when:
1. ✅ Organizer can create team-based hackathon with size constraints
2. ✅ Student sees team registration form for team hackathons
3. ✅ Team registration saves correctly with all member data
4. ✅ Organizer can view complete team details
5. ✅ All validation rules work as expected
6. ✅ No console errors in browser or backend

---

## 📞 Support

If you encounter issues:
1. Check [TEAM_REGISTRATION_IMPLEMENTATION_COMPLETE.md](./TEAM_REGISTRATION_IMPLEMENTATION_COMPLETE.md) for detailed documentation
2. Review backend console logs
3. Check browser developer console
4. Verify MongoDB data structure

---

**Last Updated**: January 19, 2026
**Status**: Ready for Testing ✅
