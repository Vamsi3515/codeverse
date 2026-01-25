# Online Hackathon Simplified Flow (Temporary)

## Changes Made
1. **Skipped Verification**: In `StudentDashboard.jsx`, the "Join Hackathon" button now bypasses Face Verification and directly navigates to the editor.
2. **Enhanced Online Editor**: 
   - Replaced dummy editor with a full-featured Monaco Editor (VS Code like experience).
   - Fetches real problem statements from the backend (`/api/hackathons/:id`).
   - Implemented "Run Code" (Mock execution against sample test cases).
   - Implemented "Submit Code" (Mock submission against hidden test cases).
   - Supports Python, Java, C++, C.

## How to Test
1. **Login as Student**: Go to student dashboard.
2. **Join Hackathon**: Click "Join Hackathon" on any active Online Hackathon.
   - *Expected*: Immediate redirection to Editor page. No camera popup.
3. **Editor Experience**:
   - Verify Problem Details are loaded on the left.
   - Type code in the Monaco Editor on the right.
   - Switch languages and see template code update.
   - Click "Run Code": See "Running..." then output console.
   - Click "Submit": See success/failure status.

## Restoration Guide
To restore face verification later:
1. Open `src/pages/StudentDashboard.jsx`.
2. Find `handleJoinOnlineHackathon`.
3. Uncomment the `setFaceVerificationModal` block and remove the direct `navigate` call.
