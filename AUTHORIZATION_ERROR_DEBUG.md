# 🔧 Authorization Error Debugging Guide

**Error:** "Not authorized to add problems to this hackathon"

---

## ⚠️ Why This Happens

The backend is checking if you (the user who created the draft hackathon) are the same user trying to add problems. If they don't match, authorization fails.

**Causes:**
1. ❌ Token expired between creating draft and adding problem
2. ❌ Logged in with different account/browser tab
3. ❌ Multiple users in same browser session
4. ❌ Backend database issue with organizer field
5. ❌ Frontend not storing hackathon ID correctly

---

## 🔍 How to Debug

### **Step 1: Check Browser Console (F12)**

Open Developer Tools and go to **Console** tab. When you click "Save Problem to Database", look for:

```
🔍 Add Problem Statement clicked
Current Problem: {...}
✅ All validations passed
📝 No draft hackathon yet, creating one...
🔐 Token: ✅ Present
📝 Creating draft with title: [YOUR_TITLE]
📡 Draft creation response status: 201
📡 Draft creation response: { success: true, hackathon: { _id: '...' } }
✅ Draft hackathon created with ID: 67890abc...
🎯 Using hackathon ID: 67890abc...
🚀 Sending problem to API...
📦 Payload: {...}
📡 Response status: 403
📡 Response data: { success: false, message: 'Not authorized...' }
❌ API returned error: Not authorized to add problems to this hackathon
```

### **Step 2: Check Backend Logs**

Look at backend terminal output for:

```
🔍 Creating draft hackathon for organizer ID: 614e7a8c9f...
✅ Draft hackathon created: 67890abc...
  Organizer ID stored: 614e7a8c9f...
  Request User ID was: 614e7a8c9f...

🔍 Creating draft hackathon for organizer ID: 614e7a8c9f...
🔒 Authorization Check:
  Hackathon Organizer: 614e7a8c9f...
  Request User ID: 614e7a8c9f...
  Are they equal? true
✅ Authorization passed
```

### **Step 3: Compare IDs**

In the logs, look for:
- **Draft Creation Organizer ID** (from first request)
- **Second Request User ID** (from second request)

If they're different → **TOKEN ISSUE**
If they're the same but still rejected → **DATABASE ISSUE**

---

## 🛠️ Solutions

### **Solution 1: Token Expired**

Your authentication token expired between creating the draft and adding the problem.

**Fix:**
1. Refresh the page (F5)
2. Log out and log back in
3. Try again immediately (don't wait too long)

### **Solution 2: Different User**

You might be logged in as different user in different tabs.

**Fix:**
1. Close all tabs except one
2. Make sure you're only logged in once
3. Try again

### **Solution 3: Browser Cache Issue**

**Fix:**
1. Press **Ctrl+Shift+Delete** (or Cmd+Shift+Delete on Mac)
2. Clear **Cookies** and **Cache**
3. Refresh page and try again

### **Solution 4: Backend Database Issue**

The organizer field might not be storing correctly.

**Fix (Contact Developer):**
Show them the console logs:
- Draft creation response (check if `hackathon.organizer` is returned)
- Backend logs (check if organizer ID is stored)
- Add problem logs (check what user ID is being compared)

---

## 📋 Complete Workflow (Should Work)

1. ✅ Fill Hackathon Title (e.g., "AI-DATA")
2. ✅ Fill Hackathon Description
3. ✅ Select Mode (Online)
4. ✅ Click "Add New Coding Problem"
5. ✅ Fill Problem Title & Description
6. ✅ Fill Input Format & Output Format
7. ✅ Add Sample Test Case (click "Add Test Case")
8. ✅ Change toggle to "Hidden Test Case"
9. ✅ Add Hidden Test Case (click "Add Test Case")
10. ✅ Select Programming Languages (C, C++, Java, Python)
11. ✅ Click "Save Problem to Database"

**Expected Result:**
```
✅ Draft hackathon created with ID: [ID]
✅ Problem added successfully!
```

---

## 🚨 Still Getting Error?

If you still get "Not authorized" after trying all solutions:

### Send This Info to Developer:

1. **Browser Console Logs** (copy-paste everything)
2. **Backend Terminal Logs** (copy-paste the authorization check)
3. **Your Username** (the account you're logged in as)
4. **Timestamp** (when error occurred)
5. **Screenshots** of both frontend and backend logs

**Example:**
```
Frontend Console:
🔍 Add Problem Statement clicked
✅ Draft hackathon created with ID: 67890abc123...
🎯 Using hackathon ID: 67890abc123...
📡 Response status: 403
❌ Not authorized to add problems to this hackathon

Backend Console:
🔍 Creating draft hackathon for organizer ID: 614e7a8c9f...
✅ Draft hackathon created: 67890abc123...
  Organizer ID stored: 614e7a8c9f...

🔒 Authorization Check:
  Hackathon Organizer: 614e7a8c9f...
  Request User ID: 614e7a8c9f...
  Are they equal? false ← THIS IS THE PROBLEM!
```

---

## 💡 Quick Checklist Before Trying Again

- [ ] Browser console cleared
- [ ] Backend running (not crashed)
- [ ] Token not expired (logged in recently)
- [ ] Only one browser tab logged in
- [ ] Using same account
- [ ] Test cases actually added (check validation checklist)
- [ ] API URL is correct (localhost:5000)
- [ ] Network connection is stable

---

**Status:** With detailed logging now enabled, we can see exactly where the mismatch occurs and fix it!
