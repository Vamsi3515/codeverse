# CodeVerse Campus - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Sign Up
Create a new user account
```
POST /auth/signup
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "college": "XYZ Engineering College",
  "branch": "Computer Science",
  "semester": 5,
  "regNumber": "CS2024001"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student",
    "isVerified": false
  }
}
```

### 2. Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student",
    "college": "XYZ Engineering College",
    "isVerified": true,
    "coins": 0
  }
}
```

### 3. Verify Email
```
GET /auth/verify-email/:token
```

### 4. Forgot Password
```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### 5. Reset Password
```
PUT /auth/reset-password/:token
```

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

### 6. Get Current User (Protected)
```
GET /auth/me
```

### 7. Update Profile (Protected)
```
PUT /auth/update-profile
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "bio": "Developer and hackathon enthusiast",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

---

## Hackathon Endpoints

### 1. Create Hackathon (Protected - Organizer)
```
POST /hackathons
```

**Request Body:**
```json
{
  "title": "TechFest 2024",
  "description": "Annual tech competition",
  "college": "XYZ Engineering College",
  "mode": "hybrid",
  "startDate": "2024-03-15T10:00:00Z",
  "endDate": "2024-03-16T18:00:00Z",
  "registrationStartDate": "2024-02-01T00:00:00Z",
  "registrationEndDate": "2024-03-14T23:59:59Z",
  "duration": 24,
  "location": {
    "address": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "coordinates": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    }
  },
  "eligibility": {
    "minSemester": 3,
    "maxSemester": 8,
    "allowedColleges": [],
    "branches": ["CSE", "ECE", "ME"]
  },
  "maxParticipants": 500,
  "registrationFee": 0,
  "teamSize": {
    "min": 1,
    "max": 4
  },
  "rules": ["No cheating", "Original work only"],
  "prizes": {
    "first": "₹50,000",
    "second": "₹30,000",
    "third": "₹20,000"
  },
  "theme": "AI & Machine Learning",
  "antiCheatRules": {
    "tabSwitchLimit": 3,
    "copyPasteRestricted": true,
    "screenShareRequired": true,
    "activityTracking": true,
    "webcamRequired": true
  },
  "guidedParticipation": {
    "enabled": true,
    "commonQuestions": [
      {
        "question": "How to submit?",
        "answer": "Use the submission portal"
      }
    ],
    "hints": []
  }
}
```

### 2. Get All Hackathons
```
GET /hackathons?page=1&limit=10&status=published&mode=online&search=tech
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `status` - Filter by status (draft, published, ongoing, completed, cancelled)
- `mode` - Filter by mode (online, offline, hybrid)
- `college` - Filter by college
- `search` - Search query

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 50,
  "pages": 10,
  "hackathons": [...]
}
```

### 3. Get Nearby Hackathons
```
GET /hackathons/nearby?latitude=12.9716&longitude=77.5946&radius=50
```

**Query Parameters:**
- `latitude` - User's latitude (required)
- `longitude` - User's longitude (required)
- `radius` - Search radius in km (default: 50)

### 4. Search Hackathons
```
GET /hackathons/search?query=tech
```

### 5. Get Hackathon Details
```
GET /hackathons/:hackathonId
```

### 6. Update Hackathon (Protected - Organizer)
```
PUT /hackathons/:hackathonId
```

### 7. Publish Hackathon (Protected - Organizer)
```
PUT /hackathons/:hackathonId/publish
```

### 8. Delete Hackathon (Protected - Organizer)
```
DELETE /hackathons/:hackathonId
```

### 9. Get My Hackathons (Protected - Organizer)
```
GET /hackathons/organizer/my-hackathons?page=1&limit=10
```

---

## Registration Endpoints

### 1. Register for Hackathon (Protected)
```
POST /registrations
```

**Request Body:**
```json
{
  "hackathonId": "hackathon_id",
  "teamId": "team_id (optional)"
}
```

### 2. Get My Registrations (Protected)
```
GET /registrations/my-registrations?page=1&limit=10
```

### 3. Withdraw Registration (Protected)
```
DELETE /registrations/:registrationId
```

### 4. Get Hackathon Registrations (Protected - Organizer)
```
GET /registrations/hackathon/:hackathonId?page=1&limit=10&status=registered
```

### 5. Mark as Attended (Protected - Organizer)
```
PUT /registrations/:registrationId/mark-attended
```

### 6. Get Registration Stats (Protected - Organizer)
```
GET /registrations/hackathon/:hackathonId/stats
```

---

## Team Endpoints

### 1. Create Team (Protected)
```
POST /teams
```

**Request Body:**
```json
{
  "name": "Team Alpha",
  "hackathonId": "hackathon_id",
  "description": "Passionate developers"
}
```

### 2. Get Team Details (Protected)
```
GET /teams/:teamId
```

### 3. Update Team (Protected)
```
PUT /teams/:teamId
```

**Request Body:**
```json
{
  "name": "Team Alpha V2",
  "description": "Updated description"
}
```

### 4. Add Team Member (Protected)
```
POST /teams/:teamId/add-member
```

**Request Body:**
```json
{
  "userId": "user_id"
}
```

### 5. Remove Team Member (Protected)
```
DELETE /teams/:teamId/member/:userId
```

### 6. Invite Team Member (Protected)
```
POST /teams/:teamId/invite
```

**Request Body:**
```json
{
  "userId": "user_id"
}
```

### 7. Respond to Invitation (Protected)
```
PUT /teams/:teamId/respond-invitation
```

**Request Body:**
```json
{
  "response": "accept" // or "reject"
}
```

### 8. Submit Team Project (Protected)
```
PUT /teams/:teamId/submit
```

**Request Body:**
```json
{
  "projectLink": "https://github.com/user/project",
  "videoLink": "https://youtube.com/watch?v=...",
  "description": "Project description",
  "technologies": ["Node.js", "React", "MongoDB"]
}
```

### 9. Get Teams by Hackathon (Protected)
```
GET /teams/hackathon/:hackathonId?page=1&limit=10
```

### 10. Get My Teams (Protected)
```
GET /teams/my/teams?page=1&limit=10
```

---

## Results & Leaderboard Endpoints

### 1. Declare Results (Protected - Organizer)
```
POST /results/hackathon/:hackathonId/declare
```

**Request Body:**
```json
{
  "teamScores": [
    {
      "teamId": "team_id_1",
      "score": 95
    },
    {
      "teamId": "team_id_2",
      "score": 88
    }
  ]
}
```

### 2. Generate Certificates (Protected - Organizer)
```
POST /results/hackathon/:hackathonId/generate-certificates
```

### 3. Add Judge Score (Protected - Organizer)
```
POST /results/:resultId/add-score
```

**Request Body:**
```json
{
  "score": 85,
  "feedback": "Great implementation"
}
```

### 4. Get Hackathon Leaderboard
```
GET /results/hackathon/:hackathonId/leaderboard?limit=20
```

### 5. Get Global Leaderboard
```
GET /results/global-leaderboard?limit=100
```

### 6. Get Hackathon Results
```
GET /results/hackathon/:hackathonId/results?page=1&limit=20
```

### 7. Get User Certificates (Protected)
```
GET /results/my/certificates?page=1&limit=10
```

---

## Notification Endpoints

### 1. Get Notifications (Protected)
```
GET /notifications?page=1&limit=20&isRead=false
```

**Query Parameters:**
- `page` - Page number
- `limit` - Results per page
- `isRead` - Filter by read status (true/false)

### 2. Get Unread Count (Protected)
```
GET /notifications/unread/count
```

### 3. Mark as Read (Protected)
```
PUT /notifications/:notificationId/read
```

### 4. Mark All as Read (Protected)
```
PUT /notifications/mark-all-read
```

### 5. Delete Notification (Protected)
```
DELETE /notifications/:notificationId
```

### 6. Send Registration Reminders (Protected - Organizer)
```
POST /notifications/hackathon/:hackathonId/send-reminders
```

### 7. Send Event Start Notifications (Protected - Organizer)
```
POST /notifications/hackathon/:hackathonId/send-start
```

---

## Analytics Endpoints

### 1. Get Hackathon Analytics (Protected - Organizer)
```
GET /analytics/hackathon/:hackathonId
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "registrationStats": {
      "total": 150,
      "attended": 120,
      "withdrawn": 10,
      "registered": 20
    },
    "teamStats": {
      "total": 40,
      "submitted": 38
    },
    "collegeWiseParticipation": [...],
    "topTeams": [...],
    "registrationsOverTime": [...]
  }
}
```

### 2. Get Admin Dashboard (Protected - Admin)
```
GET /analytics/admin/dashboard
```

### 3. Get User Analytics (Protected)
```
GET /analytics/user/my-analytics
```

### 4. Get College Analytics (Protected)
```
GET /analytics/college?college=XYZ%20Engineering%20College
```

---

## Anti-Cheating Endpoints

### 1. Log Activity (Protected)
```
POST /activities/log
```

**Request Body:**
```json
{
  "hackathonId": "hackathon_id",
  "activityType": "tab_switch",
  "severity": "low",
  "details": {
    "timestamp": "2024-03-15T10:30:00Z"
  }
}
```

### 2. Get Activity Logs (Protected - Organizer)
```
GET /activities/:hackathonId?page=1&limit=20&flaggedOnly=true
```

### 3. Get User Activity Logs (Protected)
```
GET /activities/:hackathonId/user?page=1&limit=20
```

### 4. Get Anti-Cheat Report (Protected - Organizer)
```
GET /activities/:hackathonId/report
```

### 5. Disqualify User (Protected - Organizer)
```
POST /activities/disqualify
```

**Request Body:**
```json
{
  "userId": "user_id",
  "hackathonId": "hackathon_id",
  "reason": "Multiple tab switches detected"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently not implemented. Will be added in future versions.

## WebSocket Events (Socket.io)

### Connecting
```javascript
socket.emit('join-notifications', userId);
socket.emit('join-contest', hackathonId);
```

### Events
- `activity-log` - Send activity logs
- `activity-update` - Receive activity updates
- `update-leaderboard` - Send leaderboard updates
- `leaderboard-update` - Receive leaderboard updates

---

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response includes:**
- `count` - Number of items in current page
- `total` - Total number of items
- `pages` - Total number of pages

---

## Examples

### Example: Complete Hackathon Flow

1. **Create Hackathon (as organizer)**
   ```bash
   POST /hackathons
   ```

2. **Publish Hackathon**
   ```bash
   PUT /hackathons/:id/publish
   ```

3. **Register for Hackathon (as student)**
   ```bash
   POST /registrations
   ```

4. **Create Team**
   ```bash
   POST /teams
   ```

5. **Invite Team Members**
   ```bash
   POST /teams/:id/invite
   ```

6. **Submit Project**
   ```bash
   PUT /teams/:id/submit
   ```

7. **Declare Results (as organizer)**
   ```bash
   POST /results/hackathon/:id/declare
   ```

8. **Generate Certificates**
   ```bash
   POST /results/hackathon/:id/generate-certificates
   ```

9. **View Results**
   ```bash
   GET /results/hackathon/:id/leaderboard
   ```

---

## Support

For API issues, please check the server logs and ensure:
- MongoDB is running
- All environment variables are set
- JWT token is valid and not expired
- Required fields are provided in request bodies
