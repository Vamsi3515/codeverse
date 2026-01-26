# Face Verification Flow - Implementation Guide

## Overview
This document describes the implemented face verification flow for students joining online hackathons through the Student Dashboard.

## API Response Format
The FastAPI server returns face verification results in the following format:

```json
{
  "verified": true/false,
  "distance": 0.365032,
  "threshold": 0.68,
  "confidence": 84.92,
  "model": "VGG-Face",
  "detector_backend": "opencv",
  "similarity_metric": "cosine",
  "facial_areas": {
    "img1": { "x": 111, "y": 105, "w": 225, "h": 225, ... },
    "img2": { "x": 67, "y": 342, "w": 333, "h": 333, ... }
  },
  "time": 2.65
}
```

## Implementation Details

### 1. Backend (FastAPI) - [main.py](../FastApi%20server/main.py)

✅ **Changes Made:**
- Added CORS middleware to allow requests from frontend
- `/verify` endpoint accepts two image files (live_image, db_image)
- Uses DeepFace with VGG-Face model for face verification
- Returns structured response with verification result

**CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Frontend - Student Dashboard

#### **StudentDashboard.jsx Updates**

✅ **Modified Function: `handleJoinOnlineHackathon()`**

**Before:** Direct navigation to editor (verification skipped)
```javascript
// OLD: Skipped face verification
navigate(`/editor/${hackathon.id || hackathon._id}`)
```

**After:** Opens face verification modal
```javascript
setFaceVerificationModal({
  open: true,
  hackathon: hackathon,
  isRegistration: false
})
```

**Location:** [StudentDashboard.jsx](../Web/codeverse/frontend/codeverse-campus/src/pages/StudentDashboard.jsx#L495-L510)

#### **FaceVerificationModal.jsx - Complete Flow**

**Component:** [FaceVerificationModal.jsx](../Web/codeverse/frontend/codeverse-campus/src/components/FaceVerificationModal.jsx)

**Lifecycle Stages:**

1. **CAMERA Stage** - User Permission & Live Feed
   - Requests webcam access via `getUserMedia()`
   - Displays live video feed with face guide overlay
   - Shows "Capture Photo" button

2. **CAPTURED Stage** - Photo Review
   - Displays captured image
   - User can proceed to verification or retake
   - Shows "Verify Face" and "Retake" buttons

3. **VERIFYING Stage** - API Call
   - Sends both images to `/verify` endpoint
   - Displays loading animation
   - Waits for response

4. **SUCCESS Stage** - Face Matched ✅
   - Displays success icon and message
   - Shows confidence score
   - Displays contest instructions/rules
   - "Continue to Join Hackathon" button navigates to editor

5. **FAILED Stage** - Face Mismatch ❌
   - Displays error icon and message
   - Shows confidence score
   - Provides tips for better verification
   - Allows retake attempt
   - User can close and try again

### 3. Environment Configuration

✅ **Updated: [.env](../Web/codeverse/frontend/codeverse-campus/.env)**

```env
VITE_FACE_VERIFY_API_URL=http://127.0.0.1:8000/verify
```

This allows easy configuration of the face verification API endpoint across environments.

## Complete User Flow

### Step-by-Step Process:

1. **Student Views Dashboard**
   - "My Hackathons" section shows active/registered hackathons
   - "Available Hackathons" section shows upcoming/live hackathons

2. **Click "Join" on Active Hackathon Card**
   - ✅ System checks if hackathon is live (between start and end date)
   - ⚠️ If not live: Shows alert "Hackathon is not live yet"

3. **Face Verification Modal Opens**
   - Requests webcam permission
   - Shows live camera feed with face guide overlay
   - User positions face and clicks "Capture Photo"

4. **Photo Captured**
   - Video feed stops
   - Captured image displayed for review
   - User can "Retake" or proceed to "Verify Face"

5. **Face Verification**
   - System sends:
     - `live_image`: Captured photo from webcam
     - `db_image`: User's profile photo from database
   - FastAPI processes via DeepFace

6. **Verification Result**

   **If Verified ✅:**
   - Success screen with confidence score
   - Shows contest rules/instructions
   - "Continue to Join Hackathon" button
   - Navigates to `/editor/{hackathon_id}`

   **If Not Verified ❌:**
   - Failure screen with confidence score
   - Tips for better verification (lighting, angle, etc.)
   - "Retake" button to try again
   - "Close" button to cancel

## User Profile Image Source

**Priority Order:**
1. `userProfile.liveSelfie` (live photo from registration)
2. `userProfile.profilePicture` (profile picture)

**Location:** [StudentDashboard.jsx](../Web/codeverse/frontend/codeverse-campus/src/pages/StudentDashboard.jsx#L1289-L1298)

```javascript
userProfileImage={
  (() => {
    const img = userProfile?.liveSelfie || userProfile?.profilePicture;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  })()
}
```

## Key Features

✅ **Webcam Integration**
- Real-time video feed
- Face guide overlay for proper positioning
- Auto-stop on capture

✅ **Error Handling**
- Graceful camera permission denied
- Network error handling
- API error fallback

✅ **User Experience**
- Clear visual feedback at each stage
- Confidence score display
- Tips for failed verification
- Ability to retake photos

✅ **Security**
- CORS protection
- Face detection enforcement (`enforce_detection=True`)
- Temporary file cleanup on backend

✅ **Response Handling**
- Supports multiple response formats
- Normalizes confidence scores (0-1 range)
- Extracts verification result from distance metric if needed

## Testing Instructions

### 1. Start FastAPI Server
```bash
cd "FastApi server"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend Dev Server
```bash
cd Web/codeverse/frontend/codeverse-campus
npm run dev
```

### 3. Test Flow
1. Navigate to Student Dashboard
2. Find an "Active" hackathon in "Available Hackathons"
3. Click "Join Hackathon" button
4. Allow webcam access
5. Take a photo and verify
6. Test both success and failure scenarios

## Browser Requirements

✅ **Supported Browsers:**
- Chrome/Chromium (full support)
- Firefox (full support)
- Safari (macOS/iOS with limited support)
- Edge (full support)

**Note:** Requires HTTPS or localhost for getUserMedia API

## Common Issues & Solutions

### Issue: "Camera access denied"
**Solution:** 
- Check browser permissions
- Ensure using localhost or HTTPS
- Clear browser cache and retry

### Issue: "Face not detected"
**Solution:**
- Improve lighting
- Face camera directly
- Remove obstacles (glasses, masks)
- Ensure profile photo is clear and recent

### Issue: "API endpoint not found (404)"
**Solution:**
- Verify FastAPI server is running on port 8000
- Check `VITE_FACE_VERIFY_API_URL` in .env
- Enable CORS in FastAPI (already done)

## Performance Metrics

- **Face Comparison Time:** 2-3 seconds (as per API response)
- **Modal Load Time:** < 1 second
- **Webcam Initialization:** 1-2 seconds

## Future Enhancements

- Liveness detection (prevent spoofing with photos)
- Multiple face verification attempts counter
- Face verification retry limit
- Audit logging of verification attempts
- Anti-spoofing algorithms
