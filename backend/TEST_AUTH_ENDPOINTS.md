# Authentication API - Testing Guide

## ✅ MongoDB Connection Status
**Status:** Connected successfully to MongoDB Atlas
**Database:** codeverse-campus
**Server:** Running on port 5000

---

## 🔐 Authentication Endpoints

### 1. Sign Up / Register

**Endpoint:** `POST http://localhost:5000/api/auth/register`  
**Alternative:** `POST http://localhost:5000/api/auth/signup`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phone": "1234567890",
  "college": "State University",
  "role": "student"
}
```

**For Organizer:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "password": "OrganizerPass123",
  "phone": "0987654321",
  "college": "Tech College",
  "role": "organizer"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "676...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "isVerified": false
  }
}
```

---

### 2. Sign In / Login

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "676...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "college": "State University",
    "isVerified": false,
    "coins": 0
  }
}
```

**Error Response (Invalid Credentials):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 🧪 Testing with cURL

### Register a new student:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Test\",\"lastName\":\"Student\",\"email\":\"test@student.com\",\"password\":\"Test123\",\"phone\":\"1234567890\",\"college\":\"Test College\",\"role\":\"student\"}"
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@student.com\",\"password\":\"Test123\"}"
```

---

## 🧪 Testing with PowerShell

### Register:
```powershell
$body = @{
    firstName = "Test"
    lastName = "Student"
    email = "test@student.com"
    password = "Test123456"
    phone = "1234567890"
    college = "Test College"
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Login:
```powershell
$body = @{
    email = "test@student.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

---

## ✅ Implementation Details

### Security Features:
- ✅ Passwords are hashed using **bcrypt** before storing
- ✅ Plain text passwords are **NEVER** stored
- ✅ Password field is **excluded** from query responses by default
- ✅ Email uniqueness is enforced
- ✅ JWT tokens are generated on successful auth
- ✅ Supports both **student** and **organizer** roles

### User Model Fields:
- firstName, lastName
- email (unique, validated)
- password (hashed with bcrypt)
- phone
- college
- role (student | organizer | admin)
- branch, semester, regNumber (optional for students)
- isVerified, coins, timestamps

### Database:
- **Collection:** users
- **Database:** codeverse-campus
- **Connection:** MongoDB Atlas

---

## 🎯 Frontend Integration

### From your React frontend, use:

```javascript
// Sign Up
const signup = async (userData) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return await response.json();
};

// Sign In
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await response.json();
};
```

---

## 📝 Notes

1. The backend is **already fully implemented** with authentication
2. MongoDB connection is **working**
3. Both `/register` and `/signup` endpoints work (aliases)
4. Passwords are **securely hashed**
5. JWT tokens are returned for session management
6. Email verification system is available (optional)

**Status:** ✅ Ready to use!
