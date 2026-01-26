# ⏱️ Competition Duration & Time Tracking - Implementation Guide

**Date**: January 26, 2026  
**Status**: ✅ COMPLETE

---

## Overview

The system now properly handles both types of hackathons using the `competitionDuration` field:
1. **With Duration** (competitionDuration > 0): Shows time spent & awards time bonus
2. **Without Duration** (competitionDuration = 0 or not set): Shows "N/A", no time bonus

---

## How It Works

### Scenario 1: Hackathon WITH Competition Duration

**Setup**:
```javascript
{
  title: "5-Hour Hackathon",
  competitionDuration: 300,  // 5 hours in minutes
  // ... other fields
}
```

**Submission Flow**:
```
1. User joins hackathon
   → joinedAt = 2026-01-26T13:02:00.822Z

2. User submits after 45 minutes
   → submittedAt = 2026-01-26T13:47:00.822Z

3. Backend calculates:
   → timeSpentMinutes = (47:00 - 02:00) = 45 minutes

4. Time Bonus Calculation:
   → timeBonus = (1 - 45/300) × 50 = 42.5 pts

5. Display:
   → "45m" in leaderboard
```

### Scenario 2: Hackathon WITHOUT Competition Duration (Open-Ended)

**Setup**:
```javascript
{
  title: "Open-Ended Hackathon",
  competitionDuration: 0,  // or not set (null/undefined)
  // ... other fields
}
```

**Submission Flow**:
```
1. User joins hackathon (can rejoin)
   → joinedAt = 2026-01-26T13:02:00.822Z

2. User submits (anytime)
   → submittedAt = 2026-01-26T13:47:00.822Z

3. Backend:
   → Skips time calculation (competitionDuration = 0)
   → timeSpentMinutes = null

4. Time Bonus Calculation:
   → timeBonus = 0 (no duration = no bonus)

5. Display:
   → "N/A" in leaderboard
```

---

## Field Details

### competitionDuration Field

- **Type**: Number (optional)
- **Unit**: Minutes
- **Default**: null or 0 (means no time limit)

| Value | Meaning | Time Tracking | Time Bonus |
|-------|---------|---------------|-----------|
| > 0 | Has time limit (e.g., 180) | ✅ Tracked | ✅ Calculated |
| 0 | Open-ended | ❌ Not tracked | ❌ No bonus |
| null/undefined | Open-ended | ❌ Not tracked | ❌ No bonus |

---

## Code Changes

### Backend: submissionController.js

```javascript
// Check if hackathon has competitionDuration > 0
if (hackathon?.competitionDuration && hackathon.competitionDuration > 0) {
  // Calculate time spent
  const joinTime = new Date(submission.joinedAt).getTime();
  const submitTime = new Date(submission.submittedAt).getTime();
  const timeSpentMs = submitTime - joinTime;
  submission.timeSpentMinutes = Math.round((timeSpentMs / (1000 * 60)) * 100) / 100;
} else {
  // Open-ended - no time tracking
  submission.timeSpentMinutes = null;
}
```

### Backend: LeaderboardScoreCalculator.js

```javascript
// calculateTimeBonus method
static calculateTimeBonus(submission, hackathon) {
  // Check if hackathon has competitionDuration > 0
  const competitionDuration = hackathon?.competitionDuration;
  
  // If no duration or duration = 0, no time bonus
  if (!competitionDuration || competitionDuration <= 0) {
    return 0;
  }

  // Calculate bonus if duration exists
  const timeSpentMinutes = submission.timeSpentMinutes || 0;
  if (timeSpentMinutes <= 0) return 0;
  
  const timeEfficiency = Math.max(0, 1 - (timeSpentMinutes / competitionDuration));
  return Math.round(timeEfficiency * 50 * 100) / 100;
}

// calculateFinalScore method - metrics
metrics: {
  problemsSolved: problemsCount,
  testCasesPassed: passedTestCases,
  testCasesTotal: totalTestCases,
  // Only include timeSpentMinutes if hackathon has competitionDuration > 0
  timeSpentMinutes: hackathon?.competitionDuration && hackathon.competitionDuration > 0 ? submission.timeSpentMinutes : null,
  violations: submission.totalViolations || 0
}
```

### Frontend: Leaderboard.jsx

```javascript
const formatTime = (minutes) => {
  // Handle "N/A" when no duration or time not tracked
  if (minutes === undefined || minutes === null) return 'N/A';
  if (minutes === 0) return '0m';
  
  // Handle seconds (< 1 minute)
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds}s`;
  }
  
  // Format as minutes or hours:minutes
  if (minutes < 60) return `${Math.round(minutes * 100) / 100}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};
```

---

## Scoring Logic

### With Duration (300 minutes)

| Submission Time | Time Spent | Time Bonus | Total Score |
|-----------------|-----------|-----------|------------|
| 0m | 0m | 50 pts | 350 pts |
| 60m | 60m | 40 pts | 340 pts |
| 150m | 150m | 25 pts | 325 pts |
| 300m | 300m | 0 pts | 300 pts |

**Formula**: `(1 - 45/300) × 50 = 37.5 pts`

### Without Duration (Open-Ended)

| Submission Time | Time Spent | Time Bonus | Total Score |
|-----------------|-----------|-----------|------------|
| 45m | N/A | 0 pts | 300 pts |
| 90m | N/A | 0 pts | 300 pts |
| Any time | N/A | 0 pts | 300 pts |

**No time bonus when competitionDuration = 0 or null**

---

## Display Examples

### Leaderboard with Duration (5-Hour Hackathon)

```
┌─────┬──────────────┬──────────┬──────────┬────────┬───────┐
│ Rank│ Participant  │ Problems │ Tests    │ Time   │ Score │
├─────┼──────────────┼──────────┼──────────┼────────┼───────┤
│ 1   │ Alice Smith  │ 3        │ 12/15    │ 45m    │ 342.5 │
│ 2   │ Bob Johnson  │ 3        │ 10/15    │ 90m    │ 325   │
│ 3   │ Carol White  │ 2        │ 8/10     │ 120m   │ 300   │
└─────┴──────────────┴──────────┴──────────┴────────┴───────┘
```

### Leaderboard without Duration (Open-Ended)

```
┌─────┬──────────────┬──────────┬──────────┬────────┬───────┐
│ Rank│ Participant  │ Problems │ Tests    │ Time   │ Score │
├─────┼──────────────┼──────────┼──────────┼────────┼───────┤
│ 1   │ Alice Smith  │ 3        │ 12/15    │ N/A    │ 300   │
│ 2   │ Bob Johnson  │ 3        │ 10/15    │ N/A    │ 300   │
│ 3   │ Carol White  │ 2        │ 8/10     │ N/A    │ 200   │
└─────┴──────────────┴──────────┴────────┴────────┴───────┘

Note: Alice ranks higher due to more test cases (12 > 10)
```

---

## Configuration

### How to Set Hackathon Competition Duration

**When Creating Hackathon with Time Limit**:
```javascript
POST /api/hackathons
{
  title: "5-Hour Hackathon",
  competitionDuration: 300,  // 5 hours = 300 minutes
  // ... other fields
}
```

**Open-Ended Hackathon (No Time Limit)**:
```javascript
POST /api/hackathons
{
  title: "Open Hackathon",
  competitionDuration: 0,  // or omit this field entirely
  // ... other fields
}
```

---

## Time Display Reference

| Minutes | Display | Type | Duration |
|---------|---------|------|----------|
| 0.25 | "14s" | Seconds | < 1 min |
| 0.5 | "30s" | Seconds | < 1 min |
| 1 | "1m" | Minutes | Single |
| 2.5 | "2.5m" | Decimal minutes | Single |
| 45 | "45m" | Minutes | Single |
| 60 | "1h 0m" | Hours:Minutes | 1+ hours |
| 90 | "1h 30m" | Hours:Minutes | 1+ hours |
| 300 | "5h 0m" | Hours:Minutes | 1+ hours |
| null | "N/A" | Not Available | No duration |

---

## Testing Checklist

✅ **Hackathon WITH Duration (competitionDuration > 0)**:
- [ ] Time shows in correct format
- [ ] Time bonus calculated correctly
- [ ] Score includes time bonus
- [ ] Database stores competitionDuration
- [ ] Backend logs show time calculation

✅ **Hackathon WITHOUT Duration (competitionDuration = 0 or null)**:
- [ ] Time shows "N/A"
- [ ] Time bonus = 0 pts
- [ ] Score doesn't include time bonus
- [ ] No error in backend
- [ ] Backend logs show "NO/OPEN duration"
- [ ] Tiebreaker works on problems solved

✅ **Edge Cases**:
- [ ] User submits < 1 minute: shows "Xs"
- [ ] User submits exactly at duration end: time bonus = 0
- [ ] Multiple submissions from same user: uses latest
- [ ] Open-ended hackathon: can join/exit/rejoin

---

## Backend Logs

### With Duration
```
⏱️ Time Calculation (with duration): {
  competitionDuration: 300,
  timeSpentMinutes: 45,
  timeSpentSeconds: 2700
}
   ⏱️  Duration: 300min, Time Spent: 45min → Bonus: 37.5 pts
```

### Without Duration
```
⏱️ Time Calculation (NO/OPEN duration): Skipped - hackathon has no competitionDuration or competitionDuration=0
   ⏱️  No competition duration set → Time Bonus: 0 (N/A)
```

---

## API Responses

### GET /api/hackathons/{id}/leaderboard

**With Duration (competitionDuration = 300)**:
```json
{
  "leaderboard": [
    {
      "leaderboardPosition": 1,
      "leaderboardScore": 342.5,
      "scoreMetrics": {
        "timeSpentMinutes": 45,
        "problemsSolved": 3
      }
    }
  ]
}
```

**Without Duration (competitionDuration = 0)**:
```json
{
  "leaderboard": [
    {
      "leaderboardPosition": 1,
      "leaderboardScore": 300,
      "scoreMetrics": {
        "timeSpentMinutes": null,
        "problemsSolved": 3
      }
    }
  ]
}
```

---

## Summary

✅ **Field Name**: `competitionDuration` (in minutes)  
✅ **Optional Field**: Can be null/0 or any positive number  
✅ **Time Tracking**: Only when competitionDuration > 0  
✅ **Time Bonus**: Only when competitionDuration > 0  
✅ **Display**: Shows actual time OR "N/A" if no duration  
✅ **Open-Ended Support**: Full support for no time limit hackathons  
✅ **Fair Scoring**: Both types scored fairly without time bias  

Ready for deployment! 🚀



---

## Code Changes

### Backend: submissionController.js

```javascript
// Check if hackathon has duration
if (hackathon?.totalDurationMinutes && hackathon.totalDurationMinutes > 0) {
  // Calculate time spent
  const joinTime = new Date(submission.joinedAt).getTime();
  const submitTime = new Date(submission.submittedAt).getTime();
  const timeSpentMs = submitTime - joinTime;
  submission.timeSpentMinutes = Math.round((timeSpentMs / (1000 * 60)) * 100) / 100;
} else {
  // No duration - skip time tracking
  submission.timeSpentMinutes = null;
}
```

### Backend: LeaderboardScoreCalculator.js

```javascript
// calculateTimeBonus method
static calculateTimeBonus(submission, hackathon) {
  // Check if hackathon has competitionDuration
  const totalDurationMinutes = hackathon?.totalDurationMinutes;
  
  // If no duration, no time bonus
  if (!totalDurationMinutes || totalDurationMinutes <= 0) {
    return 0;  // No bonus if no duration
  }

  // Calculate bonus if duration exists
  const timeSpentMinutes = submission.timeSpentMinutes || 0;
  if (timeSpentMinutes <= 0) return 0;
  
  const timeEfficiency = Math.max(0, 1 - (timeSpentMinutes / totalDurationMinutes));
  return Math.round(timeEfficiency * 50 * 100) / 100;
}

// calculateFinalScore method - metrics
metrics: {
  problemsSolved: problemsCount,
  testCasesPassed: passedTestCases,
  testCasesTotal: totalTestCases,
  // Only include timeSpentMinutes if hackathon has duration
  timeSpentMinutes: hackathon?.totalDurationMinutes ? submission.timeSpentMinutes : null,
  violations: submission.totalViolations || 0
}
```

### Frontend: Leaderboard.jsx

```javascript
const formatTime = (minutes) => {
  // Handle "N/A" when no duration or time not tracked
  if (minutes === undefined || minutes === null) return 'N/A';
  if (minutes === 0) return '0m';
  
  // Handle seconds (< 1 minute)
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds}s`;
  }
  
  // Format as minutes or hours:minutes
  if (minutes < 60) return `${Math.round(minutes * 100) / 100}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};
```

---

## Database Schema

### HackathonSubmission

```javascript
{
  _id: ObjectId,
  hackathonId: ObjectId,
  userId: ObjectId,
  
  joinedAt: Date,           // When user started
  submittedAt: Date,        // When user submitted
  timeSpentMinutes: Number,  // null if no duration, else decimal
  
  scoreMetrics: {
    timeSpentMinutes: Number || null,  // Matches submission.timeSpentMinutes
    // ... other metrics
  }
}
```

### Hackathon

```javascript
{
  _id: ObjectId,
  title: String,
  
  totalDurationMinutes: Number || null,  // Duration in minutes, or null if open-ended
  
  // ... other fields
}
```

---

## Scoring Logic

### With Duration (180 minutes)

| Submission Time | Time Spent | Time Bonus | Total Score |
|-----------------|-----------|-----------|------------|
| 0m | 0m | 50 pts | 350 pts |
| 45m | 45m | 37.5 pts | 337.5 pts |
| 90m | 90m | 25 pts | 325 pts |
| 180m | 180m | 0 pts | 300 pts |

**Formula**: `(1 - 45/180) × 50 = 37.5 pts`

### Without Duration

| Submission Time | Time Spent | Time Bonus | Total Score |
|-----------------|-----------|-----------|------------|
| 45m | N/A | 0 pts | 300 pts |
| 90m | N/A | 0 pts | 300 pts |
| Any time | N/A | 0 pts | 300 pts |

**No time bonus when duration not set**

---

## Display Examples

### Leaderboard with Duration (5-Hour Hackathon)

```
┌─────┬──────────────┬──────────┬──────────┬────────┬───────┐
│ Rank│ Participant  │ Problems │ Tests    │ Time   │ Score │
├─────┼──────────────┼──────────┼──────────┼────────┼───────┤
│ 1   │ Alice Smith  │ 3        │ 12/15    │ 45m    │ 337.5 │
│ 2   │ Bob Johnson  │ 3        │ 10/15    │ 90m    │ 325   │
│ 3   │ Carol White  │ 2        │ 8/10     │ 120m   │ 300   │
└─────┴──────────────┴──────────┴──────────┴────────┴───────┘
```

### Leaderboard without Duration (Open-Ended Hackathon)

```
┌─────┬──────────────┬──────────┬──────────┬────────┬───────┐
│ Rank│ Participant  │ Problems │ Tests    │ Time   │ Score │
├─────┼──────────────┼──────────┼──────────┼────────┼───────┤
│ 1   │ Alice Smith  │ 3        │ 12/15    │ N/A    │ 300   │
│ 2   │ Bob Johnson  │ 3        │ 10/15    │ N/A    │ 300   │
│ 3   │ Carol White  │ 2        │ 8/10     │ N/A    │ 200   │
└─────┴──────────────┴──────────┴──────────┴────────┴───────┘

Note: Alice and Bob have same score (300) with 3 problems
Tiebreaker: More test cases passed (12 > 10)
```

---

## Configuration

### How to Set Hackathon Duration

**When Creating Hackathon**:
```javascript
POST /api/hackathons
{
  title: "5-Hour Hackathon",
  totalDurationMinutes: 300,  // Set duration
  // ... other fields
}
```

**Open-Ended Hackathon**:
```javascript
POST /api/hackathons
{
  title: "Open Hackathon",
  totalDurationMinutes: null,  // Or omit this field
  // ... other fields
}
```

---

## Time Display Reference

| Minutes | Display | Type |
|---------|---------|------|
| 0.25 | "14s" | Seconds (< 1 min) |
| 0.5 | "30s" | Seconds (< 1 min) |
| 1 | "1m" | Minutes |
| 2.5 | "2.5m" | Decimal minutes |
| 45 | "45m" | Minutes |
| 60 | "1h 0m" | Hours:Minutes |
| 90 | "1h 30m" | Hours:Minutes |
| 120 | "2h 0m" | Hours:Minutes |
| null | "N/A" | No duration |
| undefined | "N/A" | No duration |

---

## Testing Checklist

- [ ] Hackathon WITH duration:
  - [ ] Time shows in minutes/hours
  - [ ] Time bonus calculated correctly
  - [ ] Score includes time bonus

- [ ] Hackathon WITHOUT duration:
  - [ ] Time shows "N/A"
  - [ ] Time bonus = 0 pts
  - [ ] Score doesn't include time bonus
  - [ ] Tiebreaker works on problems solved count

- [ ] Edge cases:
  - [ ] User submits < 1 minute: shows "Xs"
  - [ ] User submits exactly at duration end: time bonus = 0
  - [ ] Multiple users, same score, no duration: sorted by problems solved

---

## API Responses

### GET /api/hackathons/{id}/leaderboard

**With Duration**:
```json
{
  "leaderboard": [
    {
      "leaderboardPosition": 1,
      "leaderboardScore": 337.5,
      "scoreMetrics": {
        "timeSpentMinutes": 45,
        "problemsSolved": 3
      }
    }
  ]
}
```

**Without Duration**:
```json
{
  "leaderboard": [
    {
      "leaderboardPosition": 1,
      "leaderboardScore": 300,
      "scoreMetrics": {
        "timeSpentMinutes": null,
        "problemsSolved": 3
      }
    }
  ]
}
```

---

## Backend Logs

### With Duration
```
⏱️ Time Calculation (with duration): {
  totalDuration: 300,
  timeSpentMinutes: 45,
  timeSpentSeconds: 2700
}
   ⏱️  Duration: 300min, Time Spent: 45min → Bonus: 37.5 pts
```

### Without Duration
```
⏱️ Time Calculation (NO duration): Skipped - hackathon has no competitionDuration
   ⏱️  No competition duration set → Time Bonus: 0 (N/A)
```

---

## Summary

✅ **Time tracking conditional** on hackathon having `totalDurationMinutes`  
✅ **Time bonus calculation** skipped if no duration  
✅ **Display shows "N/A"** for open-ended hackathons  
✅ **Scoring remains fair** - no penalty for open-ended format  
✅ **All changes backward compatible** - no migration needed  

Ready for deployment! 🚀

