# 🚀 Quick Start: Online Hackathon Face Verification

## 📍 Where to Find API URL Configuration

### File Location:
```
frontend/codeverse-campus/src/components/FaceVerificationModal.jsx
```

### Line Number: **19**

### Current Code:
```javascript
const FACE_COMPARISON_API_URL = 'http://localhost:8000/api/face-compare'
```

### Replace With Your API:
```javascript
const FACE_COMPARISON_API_URL = 'https://your-fastapi-server.com/api/face-compare'
// Example: 'https://api.yourapp.com/face-verify'
// Example: 'https://your-app-api.herokuapp.com/compare-faces'
```

---

## 🎯 What This Does

When a student wants to **join a LIVE online hackathon**:

1. System checks if hackathon is currently LIVE (between start/end times)
2. Shows **"Join Hackathon (LIVE)"** button with 🔴 red indicator
3. Opens webcam modal for face verification
4. Student captures their photo
5. Captured image + Profile image → Sent to YOUR FastAPI
6. Your API returns `true/false` for face match
7. ✅ Success → Show instructions → Enter hackathon
8. ❌ Failure → Show error → Allow retry

---

## 🔌 API Requirements

### Your FastAPI Endpoint Should:

**Accept:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Fields:
  - `captured_image` - Image file (live from webcam)
  - `profile_image` - Image file (from database)

**Return:**
```json
{
  "success": true,
  "match": true,
  "confidence": 0.95,
  "message": "Face verified successfully!"
}
```

---

## 📝 Implementation Checklist

- [x] ✅ Face verification modal created
- [x] ✅ Webcam capture functionality
- [x] ✅ Live hackathon detection
- [x] ✅ Join button in "My Hackathons"
- [x] ✅ Success/failure handling
- [ ] ⏳ **Deploy your Face Comparison API**
- [ ] ⏳ **Update API URL in FaceVerificationModal.jsx line 19**
- [ ] ⏳ **Test end-to-end flow**

---

## 🧪 Quick Test

1. Login as student
2. Go to "My Hackathons"
3. Find LIVE online hackathon
4. Click "Join Hackathon (LIVE)" 
5. Allow webcam
6. Capture photo
7. Verify face → Should call your API
8. On success → Enter hackathon

---

## 🎨 Visual Flow

```
My Hackathons Section
        ↓
[Online Hackathon Card]
        ↓
Is it LIVE? (check startDate ≤ now ≤ endDate)
        ↓
    ✅ YES                    ❌ NO
        ↓                         ↓
[Join Hackathon (LIVE)]    [⏰ Not Live Yet]
        ↓
📸 Face Verification Modal
        ↓
Capture → Verify → Compare
        ↓
  Your FastAPI Call
        ↓
true/false response
        ↓
✅ Success              ❌ Failed
        ↓                    ↓
Enter Hackathon      Retry/Close
```

---

## 📞 Need Help?

**Check console logs:**
```javascript
// In browser DevTools Console, look for:
🎯 [JOIN HACKATHON] Initiating face verification for: ...
🔍 Calling face comparison API: ...
✅ Face comparison API response: ...
```

**Common Issues:**
- Camera denied → Allow in browser settings
- API not found → Check URL configuration
- CORS error → Enable CORS on FastAPI
- Not live → Check hackathon start/end dates

---

## 🎉 You're Almost Done!

**Just 2 steps:**
1. Deploy your FastAPI with face comparison
2. Update line 19 in FaceVerificationModal.jsx

Then you're ready to verify students attending online hackathons! 🚀

---

*Full documentation: ONLINE_HACKATHON_FACE_VERIFICATION_GUIDE.md*
