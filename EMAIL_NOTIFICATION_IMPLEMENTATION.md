# Email Notification Implementation

## Feature Verified
- [x] Create Email Template for Hackathon Completion
- [x] Create Backend Controller for triggering email
- [x] Create Backend Route `POST /hackathons/:id/complete`
- [x] Integrate Frontend Timer to trigger email on expiry

## Implementation Details

### 1. Email Service (`backend/src/utils/emailService.js`)
Added `generateHackathonCompletionEmail` function.

### 2. Hackathon Controller (`backend/src/controllers/hackathonController.js`)
Added `completeHackathon` method which:
- Finds user and hackathon.
- Sends email using the new template.

### 3. Routes (`backend/src/routes/hackathonRoutes.js`)
Added `router.post('/:id/complete', ...)` endpoint.

### 4. Frontend (`OnlineEditor.jsx`)
Added `useEffect` to monitor `timeLeft`.
- When `timeLeft === 0`, it calls the completion endpoint.
- Shows an alert to the user.
- Prevents duplicate calls via `completionEmailSent` state.

## Usage
When a student is in the Online Editor and the timer reaches 00:00:00, the system automatically sends a "Hackathon Completed" email to their registered address.
