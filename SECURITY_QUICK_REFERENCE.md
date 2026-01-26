# 🔐 Security Quick Reference

## What Changed?

### ✅ Before (VULNERABLE)
```jsx
// Routes had NO protection
<Route path="/dashboard/student" element={<StudentDashboard />} />

// Users could:
- Copy URL and open in new browser without logging in
- Access any page if they knew the URL
- Access pages meant for different roles
```

### ✅ After (SECURE)
```jsx
// Routes now have protection
<Route path="/dashboard/student" element={
  <StudentProtectedRoute>
    <StudentDashboard />
  </StudentProtectedRoute>
} />

// Now:
- ❌ Can't access without login
- ❌ Can't access with wrong role
- ✅ Auto-redirects to login page
- ✅ Shows "Access Denied" if role mismatch
```

---

## 🛡️ Security Layers

### Layer 1: Route Guards
```jsx
<StudentProtectedRoute>...</StudentProtectedRoute>
<OrganizerProtectedRoute>...</OrganizerProtectedRoute>
```

### Layer 2: Component-Level Checks
```jsx
if (!isLoggedIn || userRole !== 'student') {
  return <AccessDenied />
}
```

### Layer 3: Session Validation
- Checks every 5 minutes
- Detects corrupted sessions
- Auto-logout if invalid

### Layer 4: Cross-Tab Sync
- Logout in one tab = logout everywhere
- Real-time session sync

---

## 📝 Protected Routes

### Student Routes
- `/dashboard/student` - Student Dashboard
- `/hackathon/:id/details` - Hackathon Details
- `/editor/:id` - Code Editor
- `/previous-hackathon-details` - Past Hackathons

### Organizer Routes
- `/dashboard/organizer` - Organizer Dashboard
- `/create-hackathon` - Create New Hackathon
- `/hackathon/:id/manage` - Manage Hackathon
- `/hackathon/:id/edit` - Edit Hackathon
- `/hackathon/:hackathonId/registrations` - View Registrations

### Public Routes (No Login Required)
- `/` - Landing Page
- `/login` - Login Selection
- `/signup` - Sign Up
- `/registration/:registrationId` - QR Registration
- `/registration/verify/:registrationId` - QR Verification

---

## 🧪 Testing Security

### Test 1: URL Copy & Paste
```
1. Copy URL: /dashboard/student
2. Open in new browser (not logged in)
3. ✅ Should redirect to /login
```

### Test 2: Role Mismatch
```
1. Login as Student
2. Try to access /dashboard/organizer
3. ✅ Should show "Access Denied"
```

### Test 3: Cross-Tab Logout
```
1. Login on Tab A
2. Open same page on Tab B
3. Logout on Tab A
4. Refresh Tab B
5. ✅ Tab B should show login page
```

### Test 4: Session Expiry
```
1. Open browser console
2. localStorage.removeItem('token')
3. Try to navigate to protected page
4. ✅ Should redirect to login
```

---

## 🚨 Debugging Tips

### Check if user is logged in
```jsx
const { isLoggedIn } = useAuth()
console.log('Logged in:', isLoggedIn)
```

### Check user role
```jsx
const { userRole } = useAuth()
console.log('User role:', userRole) // 'student' or 'organizer'
```

### Check localStorage
```javascript
// Browser Console:
localStorage.getItem('token')
localStorage.getItem('userRole')
localStorage.getItem('userName')
```

### View security logs
```
Open Browser Console → Filter by:
✅ SECURITY
❌ SECURITY VIOLATION
⚠️ SECURITY
```

---

## 🔧 Common Issues

### Issue: Login works but page still shows login
**Solution:** Ensure `userRole` matches the route requirement

### Issue: Can access page without login
**Solution:** Check that route is wrapped with `<StudentProtectedRoute>` or `<OrganizerProtectedRoute>`

### Issue: Session expires unexpectedly
**Solution:** Check `validateSession()` logs in console, may indicate corrupted session

---

## 📞 For Developers

### Adding New Protected Page
1. Create your page component
2. Wrap route with appropriate guard:
   ```jsx
   <StudentProtectedRoute>
     <MyPage />
   </StudentProtectedRoute>
   ```
3. Add component-level check (recommended):
   ```jsx
   const { isLoggedIn, userRole } = useAuth()
   if (!isLoggedIn || userRole !== 'student') return <AccessDenied />
   ```

### Files to Review
- `src/App.jsx` - Route protection
- `src/components/ProtectedRoute.jsx` - Guard components
- `src/context/AuthContext.jsx` - Auth state & validation
- `src/pages/StudentDashboard.jsx` - Example component-level check
- `src/pages/OrganizerDashboard.jsx` - Example component-level check

---

## ✨ Summary

**Security is now multi-layered:**
1. ✅ Routes are protected
2. ✅ Roles are validated
3. ✅ Sessions are monitored
4. ✅ Cross-tab logout syncs
5. ✅ Auto-redirect to login
6. ✅ Access Denied pages shown

**Result:** Secure application where users can't access pages without proper authentication!
