# Authentication Flow Diagram & Architecture

## Complete Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.jsx                                 │
│                  (Wrapped with AuthProvider)                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
    ┌───▼────────┐   ┌──────▼──────┐
    │   Navbar   │   │   Landing   │
    └────┬───────┘   └──────┬──────┘
         │                  │
    Uses useAuth()     Uses useAuth()
    getLoginState()    getLoginState()
         │                  │
         └─────────┬────────┘
                   │
                   │
        ┌──────────▼─────────┐
        │   AuthContext      │
        │  (Global State)    │
        ├────────────────────┤
        │ isLoggedIn: bool   │
        │ userRole: string   │
        │ userName: string   │
        │ userId: string     │
        │                    │
        │ login()            │
        │ logout()           │
        │ checkAuthState()   │
        └──────────┬─────────┘
                   │
        ┌──────────▼──────────────┐
        │  localStorage           │
        ├────────────────────────┤
        │ token: JWT             │
        │ userRole: student/org  │
        │ userName: Full Name    │
        │ userId: ID             │
        └────────────────────────┘
```

---

## Component Flow Diagram

```
                    User Visits App
                          │
                          ▼
                    AuthProvider mounts
                          │
                          ▼
        ┌──────────────────────────────────┐
        │ Check localStorage.getItem(token)│
        └──────────┬───────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    Token found?         No token?
        │                     │
        ▼                     ▼
    isLoggedIn            isLoggedIn
       = true                = false
        │                     │
        ├─────────┬───────────┤
        │         │           │
    ┌───▼──┐   ┌──▼───┐   ┌──▼────┐
    │Navbar│   │Landing│   │Navbar │
    └───┬──┘   └──┬───┘   └──┬─────┘
        │         │          │
    Show:     Show:      Show:
    ✅Logout  ✅Browse   ✅Sign In
    ✅Dash   Events    ✅Sign Up
    ✅Welcome          ✅Register
        │          │          │
        ▼          ▼          ▼
    [Login State]  [Not Logged In State]
    (User can      (User can
     navigate)     register/login)
```

---

## Authentication State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                   Authentication States                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌───────────┐
                    │  INITIAL  │
                    │  (Loading)│
                    └──────┬────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   Token found?                          No token?
        │                                     │
        ▼                                     ▼
   ┌─────────────┐                    ┌──────────────┐
   │   LOGGED_IN │                    │  LOGGED_OUT  │
   └──────┬──────┘                    └──────┬───────┘
          │                                  │
   User clicks                         User clicks
   Logout button                       Sign In/Sign Up
          │                                  │
          ▼                                  ▼
   logout() called                  login(token, role, name, id)
          │                                  │
          ▼                                  ▼
   localStorage cleared              localStorage set
   state reset                        state updated
          │                                  │
          └────────────┬─────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Navigate to /  │
              │ (Landing Page) │
              └────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────┐
│  StudentLogin Page   │
└──────┬───────────────┘
       │
       │ User enters: email + password
       │ Clicks "Sign In"
       │
       ▼
┌──────────────────────────────────┐
│  POST /api/auth/student/login    │
│  Backend validates & returns JWT │
└──────┬───────────────────────────┘
       │
       │ Response: {
       │   token: "eyJ...",
       │   user: {
       │     id: "123",
       │     firstName: "John",
       │     lastName: "Doe"
       │   }
       │ }
       │
       ▼
┌──────────────────────────────────┐
│  StudentLogin.jsx                │
│  Calls: login(token, 'student',  │
│             'John Doe', '123')   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  AuthContext.login()             │
│  Sets: isLoggedIn = true         │
│  Sets: userRole = 'student'      │
│  Sets: userName = 'John Doe'     │
│  Sets: userId = '123'            │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  localStorage updated:           │
│  token: JWT                      │
│  userRole: 'student'             │
│  userName: 'John Doe'            │
│  userId: '123'                   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  All components using useAuth()  │
│  re-render with new state        │
│  - Navbar: shows Logout          │
│  - Landing: shows Browse Events  │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Navigate to /dashboard/student  │
└──────────────────────────────────┘
```

---

## Logout Flow

```
┌──────────────────────────┐
│  Navbar Logout Button    │
│  onClick={handleLogout}  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  AuthContext.logout()            │
│  1. localStorage.removeItem(all) │
│  2. isLoggedIn = false           │
│  3. userRole = null              │
│  4. userName = null              │
│  5. userId = null                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  All components re-render        │
│  - Navbar: shows Sign In/Sign Up │
│  - Landing: shows Register Now   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Navigate to /                   │
│  (Landing Page)                  │
└──────────────────────────────────┘
```

---

## Navbar Rendering Logic

```
Navbar Component
      │
      ▼
const { isLoggedIn, userRole, userName, logout } = useAuth()
      │
      ▼
┌─────────────────────────────────────┐
│ if (!isLoggedIn)                    │
│   return (                          │
│     <>                              │
│       <Link>/login</Link>           │ ← Sign In
│       <Link>/signup</Link>          │ ← Sign Up
│     </>                             │
│   )                                 │
│                                     │
│ else                                │
│   return (                          │
│     <>                              │
│       <Link>{getDashboardLabel()}</Link>  │ ← Dashboard
│       <span>Welcome, {userName}</span>    │ ← Welcome
│       <button onClick={logout}>...</button>  │ ← Logout
│     </>                             │
│   )                                 │
└─────────────────────────────────────┘
```

---

## Landing Page Rendering Logic

```
Landing Component
      │
      ▼
const { isLoggedIn } = useAuth()
      │
      ▼
Each Hackathon Card:
      │
      ├─ if (!isLoggedIn)
      │    └─ <Link to="/signup">Register Now</Link>
      │
      └─ else
           └─ <Link to="/login">Browse Events</Link>
```

---

## localStorage Lifecycle

```
┌──────────────────────────────────────┐
│ Initial State (Fresh User)           │
├──────────────────────────────────────┤
│ localStorage = {}                    │ (empty)
│ isLoggedIn = false                   │
└──────┬───────────────────────────────┘
       │
       ▼
    User logs in
       │
       ▼
┌──────────────────────────────────────┐
│ After Login                          │
├──────────────────────────────────────┤
│ localStorage = {                     │
│   token: "eyJ...",                   │
│   userRole: "student",               │
│   userName: "John Doe",              │
│   userId: "123"                      │
│ }                                    │
│ isLoggedIn = true                    │
└──────┬───────────────────────────────┘
       │
       ▼
  User navigates away
  and comes back
       │
       ▼
┌──────────────────────────────────────┐
│ Page Refresh / Return                │
├──────────────────────────────────────┤
│ AuthContext.checkAuthState() runs    │
│ Finds token in localStorage          │
│ Sets isLoggedIn = true               │
│ Restores all user data               │
└──────┬───────────────────────────────┘
       │
       ▼
  User clicks logout
       │
       ▼
┌──────────────────────────────────────┐
│ After Logout                         │
├──────────────────────────────────────┤
│ All localStorage keys removed        │
│ localStorage = {}                    │
│ isLoggedIn = false                   │
│ Redirect to /                        │
└──────────────────────────────────────┘
```

---

## Button Visibility Matrix

```
┌──────────────────┬─────────────────┬──────────────────┐
│ Component        │ NOT Logged In    │ Logged In        │
├──────────────────┼─────────────────┼──────────────────┤
│ Navbar Sign In   │ ✅ Visible      │ ❌ Hidden        │
├──────────────────┼─────────────────┼──────────────────┤
│ Navbar Sign Up   │ ✅ Visible      │ ❌ Hidden        │
├──────────────────┼─────────────────┼──────────────────┤
│ Navbar Dashboard │ ❌ Hidden       │ ✅ Visible       │
├──────────────────┼─────────────────┼──────────────────┤
│ Navbar Logout    │ ❌ Hidden       │ ✅ Visible       │
├──────────────────┼─────────────────┼──────────────────┤
│ Navbar Welcome   │ ❌ Hidden       │ ✅ Visible       │
├──────────────────┼─────────────────┼──────────────────┤
│ Landing Register │ ✅ Visible      │ ❌ Hidden        │
├──────────────────┼─────────────────┼──────────────────┤
│ Landing Browse   │ ❌ Hidden       │ ✅ Visible       │
└──────────────────┴─────────────────┴──────────────────┘
```

---

## Cross-Tab Synchronization

```
Browser Tab A               Browser Tab B
(logged in)                 (not logged in)
      │                            │
      │ User logs out in Tab A     │
      ▼                            │
   logout()                        │
      │                            │
      └──────┬────────────────┐    │
             │                │    │
    localStorage              │    │
    storage event fires       │    │
             │                │    │
             ├────────────────┼────▶ Storage event listener
             │                │     catches change
             │                │    │
             │                │    ▼
             │                │ AuthContext.checkAuthState()
             │                │ Detects token removed
             │                │ Sets isLoggedIn = false
             │                │
             │                │ All components re-render
             │                │
             │                ▼
             │           Tab B now shows
             │           "Sign In" + "Sign Up"
             │           (Synced with Tab A)
             │
      Redirect to /
      (Landing Page)
```

---

## Error Handling

```
Login Attempt
      │
      ▼
API Call Fails
      │
      └─► Error message shown
          login() NOT called
          localStorage NOT updated
          isLoggedIn remains false
          User stays on login page
      
API Returns 401 (Unauthorized)
      │
      └─► logout() called
          Token cleared
          User redirected to /login
          Must login again

Page Refresh with Expired Token
      │
      ├─ AuthContext loads token from localStorage
      ├─ Frontend doesn't validate expiry
      ├─ Next API call returns 401
      ├─ Handle with try/catch in API calls
      └─ Auto-logout on 401 response
```

---

This documentation visualizes the complete authentication architecture and flow.
