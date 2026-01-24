# Quick Test Guide - Landing Page & Navbar Auth

## 5-Minute Test Flow

### Test 1: Fresh User (Not Logged In)
```
1. Open browser
2. Go to http://localhost:5173 (or https://3z4snn71-5173.inc1.devtunnels.ms)
3. EXPECTED:
   - Landing page loads
   - Hero section has "Register Now" button
   - Each hackathon card has "Register Now" button
   - Navbar shows "Sign In" and "Sign Up" buttons
   ✅ If all correct, proceed to Test 2
```

### Test 2: Student Login Flow
```
1. Click "Sign In" in navbar
2. Enter student email and password (or register new student)
3. EXPECTED:
   - Redirects to /dashboard/student
   - Navbar shows "Student Dashboard" button
   - Navbar shows "Welcome, [Student Name]" message
   - Navbar shows red "Logout" button
   - NO "Sign In" or "Sign Up" buttons visible
4. Press F5 (refresh)
5. EXPECTED:
   - Page reloads with same auth state
   - Still logged in
6. Navigate to home (click logo or go to /)
7. EXPECTED:
   - Landing page loads
   - "Register Now" changed to "Browse Events" button
   - Navbar still shows "Student Dashboard" + "Logout"
   - NO "Sign In" or "Sign Up" buttons
   ✅ If all correct, proceed to Test 3
```

### Test 3: Logout Flow
```
1. Click "Logout" button in navbar
2. EXPECTED:
   - Redirects to / (landing page)
   - Navbar now shows "Sign In" and "Sign Up" again
   - Landing page shows "Register Now" button (not "Browse Events")
   - localStorage cleared (check DevTools)
   ✅ If all correct, proceed to Test 4
```

### Test 4: Organizer Login Flow
```
1. Click "Sign Up" in navbar
2. Choose "Organizer" registration
3. Register as organizer (or use existing credentials)
4. After login:
5. EXPECTED:
   - Redirects to /dashboard/organizer
   - Navbar shows "Organizer Dashboard" button
   - Navbar shows "Welcome, [Organizer Name]" message
   - Navbar shows red "Logout" button
6. Navigate to home (/)
7. EXPECTED:
   - Landing page loads
   - "Register Now" changed to "Browse Events" button
   - Navbar still shows "Organizer Dashboard" + "Logout"
   ✅ If all correct, proceed to Test 5
```

### Test 5: State Persistence
```
1. While logged in as organizer, press F5
2. EXPECTED:
   - Page reloads
   - Navbar still shows "Organizer Dashboard" + "Logout"
   - Landing page "Browse Events" button still visible
3. Open DevTools (F12) → Application → LocalStorage
4. EXPECTED:
   - token: "eyJ..." (JWT token present)
   - userRole: "organizer"
   - userName: "Organizer Name"
   - userId: "..." (ID present)
   ✅ If all correct, test passes
```

---

## Quick Debugging

### Problem: After login, navbar still shows "Sign In" + "Sign Up"

**Check**:
1. Open DevTools (F12) → Console
2. Type: `localStorage.getItem('token')`
3. If returns `null` → login failed, check network tab
4. If returns token → AuthContext not updating, check if AuthProvider wraps Navbar

### Problem: Landing page always shows "Register Now"

**Check**:
1. Open DevTools → Console
2. Type: `localStorage.getItem('token')`
3. If returns token but button shows "Register Now" → useAuth hook not working
4. Verify AuthProvider wraps entire App in App.jsx

### Problem: Refresh page, auth state lost

**Check**:
1. Open DevTools → Application → LocalStorage
2. Verify token exists after login
3. If token exists but lost on refresh → AuthContext not checking localStorage on mount
4. Check AuthContext.jsx useEffect runs checkAuthState()

### Problem: Logout button doesn't appear after login

**Check**:
1. Open DevTools → Console
2. Type: `localStorage.getItem('token')`
3. If token exists → check Navbar.jsx conditional logic
4. Verify `isLoggedIn` value: `{if (!isLoggedIn) ? "Sign In" : "Logout"}`

---

## DevTools Network Debugging

### Check Login API Response

1. Open DevTools (F12) → Network
2. Click "Sign In"
3. Look for POST request to `/api/auth/student/login` or `/api/auth/organizer/login`
4. Click on request → Response tab
5. EXPECTED response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "userRole": "student"
  }
}
```

### Check localStorage After Login

1. Open DevTools (F12) → Application → LocalStorage
2. Select the frontend URL (http://localhost:5173 or https://...)
3. EXPECTED keys:
   - `token` (JWT token)
   - `userRole` (student or organizer)
   - `userName` (Full name from API response)
   - `userId` (User ID from API response)

---

## Expected Behavior Summary

| Scenario | Navbar Shows | Landing Shows |
|----------|--------------|---------------|
| Fresh load (not logged in) | "Sign In" + "Sign Up" | "Register Now" button |
| After student login | "Student Dashboard" + "Logout" | "Browse Events" button |
| After organizer login | "Organizer Dashboard" + "Logout" | "Browse Events" button |
| After logout | "Sign In" + "Sign Up" | "Register Now" button |
| Page refresh (logged in) | "Dashboard" + "Logout" | "Browse Events" button |

---

## One-Line Verification Commands

```javascript
// Check if logged in
localStorage.getItem('token') !== null ? 'LOGGED IN' : 'LOGGED OUT'

// Check user role
localStorage.getItem('userRole')

// Check user name
localStorage.getItem('userName')

// Clear all auth (force logout)
localStorage.removeItem('token'); localStorage.removeItem('userRole'); localStorage.removeItem('userId'); localStorage.removeItem('userName'); location.reload()

// Set fake auth (test as logged-in user)
localStorage.setItem('token', 'fake-token'); localStorage.setItem('userRole', 'student'); localStorage.setItem('userName', 'Test User'); localStorage.setItem('userId', '123'); location.reload()
```

---

## Expected Duration

- Fresh user test: 1 min
- Student login test: 2 mins
- Logout test: 1 min
- Organizer login test: 2 mins
- State persistence test: 1 min

**Total: ~7 minutes**

All systems green = Ready for deployment! ✅
