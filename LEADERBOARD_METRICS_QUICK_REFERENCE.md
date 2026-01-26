# 📊 Leaderboard Metrics - Quick Reference

## Test Cases Display

### What Changed
```javascript
// BEFORE
<p>{entry.scoreMetrics?.testCasesPassed || 0}</p>

// AFTER  
<p>{entry.scoreMetrics?.testCasesPassed || 0}/{entry.scoreMetrics?.testCasesTotal || 0}</p>
```

### Example Display
- ✅ 4/5 test cases passed
- ✅ 12/15 test cases passed  
- ❌ 0/5 test cases (if no submission)

---

## Time Spent Display

### What Changed
```javascript
// BEFORE
formatTime(minutes) {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  // ...
}
// Issue: 14 seconds → 0 minutes

// AFTER
formatTime(minutes) {
  if (minutes === undefined || minutes === null) return 'N/A';
  if (minutes === 0) return '0m';
  
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds}s`;  // Now shows 14 seconds ✅
  }
  
  if (minutes < 60) return `${Math.round(minutes * 100) / 100}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}
```

### Example Display
- ✅ 14s (14 seconds)
- ✅ 0.5m (30 seconds)
- ✅ 2.25m (2 minutes 15 seconds)
- ✅ 1h 30m (90 minutes)
- ✅ N/A (when duration not set)

---

## Time Calculation Precision

### Backend Changes
```javascript
// BEFORE
submission.timeSpentMinutes = Math.floor((timeSpentMs / (1000 * 60)));
// Result: 14 seconds = 0 minutes ❌

// AFTER
submission.timeSpentMinutes = Math.round((timeSpentMs / (1000 * 60)) * 100) / 100;
// Result: 14 seconds = 0.23 minutes (stored as decimal) ✅
```

### Why Decimal?
- Stores actual time spent (14 sec = 0.23 min)
- Accurate for time efficiency bonus calculation
- Frontend formats for display (0.23 min → "14s")

---

## Database Storage

### HackathonSubmission Model

```javascript
{
  // ... other fields ...
  
  timeSpentMinutes: 0.23,  // Decimal for precision
  
  scoreMetrics: {
    problemsSolved: 3,
    testCasesPassed: 12,
    testCasesTotal: 15,
    timeSpentMinutes: 0.23,
    violations: 0
  },
  
  leaderboardScore: 325.83
}
```

---

## User Lookup Fix

### What Changed
```javascript
// BEFORE
const user = await User.findById(userId);
// Only checked legacy User collection ❌

// AFTER
let user = await Student.findById(userId);
if (!user) {
  user = await Organizer.findById(userId);
}
if (!user) {
  user = await User.findById(userId);
}
// Checks all collections in priority order ✅
```

### Collections Checked (in order)
1. **Student** - Primary (most users)
2. **Organizer** - Secondary
3. **User** - Legacy fallback

---

## Leaderboard API Response

### GET /api/hackathons/{id}/leaderboard

```json
{
  "success": true,
  "leaderboard": [
    {
      "leaderboardPosition": 1,
      "leaderboardScore": 325.83,
      "userId": {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "scoreMetrics": {
        "problemsSolved": 3,
        "testCasesPassed": 12,
        "testCasesTotal": 15,
        "timeSpentMinutes": 0.23,
        "violations": 0
      },
      "scoreBreakdown": {
        "baseScore": 300,
        "testCasesBonus": 25,
        "timeEfficiencyBonus": 0.83,
        "violationPenalty": 0,
        "totalScore": 325.83
      }
    }
  ],
  "totalSubmissions": 25,
  "totalRanked": 25
}
```

---

## Testing Guide

### Test Case 1: Quick Submission (< 1 minute)
```
joinedAt: 2026-01-26T13:02:00.822Z
submittedAt: 2026-01-26T13:02:14.970Z
timeSpentMinutes: 0.25 (15 seconds)

✅ Display: "15s"
✅ Calculation: (1 - 0.25/180) * 50 = 49.93 pts bonus
```

### Test Case 2: Medium Submission (15 minutes)
```
timeSpentMinutes: 15.5

✅ Display: "15.5m"
✅ Calculation: (1 - 15.5/180) * 50 = 45.69 pts bonus
```

### Test Case 3: Longer Submission (2 hours 30 minutes)
```
timeSpentMinutes: 150

✅ Display: "2h 30m"
✅ Calculation: (1 - 150/180) * 50 = 8.33 pts bonus
```

---

## Common Issues & Solutions

### Issue: Test Cases Still Showing 0
**Check**:
- ✅ Problems were submitted successfully (check logs: "✅ Problem submitted successfully")
- ✅ submission.problemsSubmitted array has entries
- ✅ Each problem has testCasesPassedCount and totalTestCases

**Fix**: Restart backend server to load changes

---

### Issue: Time Showing 0m
**Check**:
- ✅ Time calculation uses decimal precision (check DB: 0.23 not 0)
- ✅ Frontend formatTime handles sub-minute times (check: `minutes < 1` returns seconds)
- ✅ Timestamps are correct (joinedAt < submittedAt)

**Fix**: 
1. Verify timeSpentMinutes is decimal in DB
2. Clear browser cache
3. Restart both frontend and backend

---

### Issue: User Not Found During Submission
**Check**:
- ✅ User is in Student collection (not just User collection)
- ✅ Token is valid
- ✅ At least one problem was submitted

**Fix**: Backend now checks Student → Organizer → User in order

---

## Rollback Instructions (if needed)

All changes are backward compatible and can be reverted individually:

1. **Time calculation**: Revert to `Math.floor()` in submissionController.js line 248
2. **Test display**: Change `{passed}/{total}` back to just `{passed}`
3. **User lookup**: Remove Student/Organizer checks, revert to User only
4. **formatTime**: Revert to original function without seconds handling

No database migration needed - all data remains compatible.

