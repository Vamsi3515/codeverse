# Problem Statement Feature - Organizer User Guide

**Feature:** Problem Statement Creation & Management for Online Hackathons  
**Date:** January 22, 2026  
**Audience:** Hackathon Organizers  

---

## Overview

This guide shows you how to manage problem statements for your ONLINE hackathons. Problem statements are the challenges that participants will solve.

**Key Points:**
- ✅ You can add problems while creating your hackathon
- ✅ You can add problems after creation (but before start)
- ✅ Problems locked once hackathon starts
- ✅ Must have ≥1 problem to publish an online hackathon
- ✅ You'll get alerts if you forget to add problems

---

## Getting Started: Create Online Hackathon

### Step 1: Create Your Hackathon
```
1. Go to "Create Hackathon"
2. Fill in basic information:
   - Title: "Code Challenge 2026"
   - College: "IIT Bombay"
   - Mode: SELECT "ONLINE" ← Important!
   - Start Date: "Jan 25, 2026, 10 AM"
3. Click "Create"
```

### Step 2: Add Problem Statements
Once created, you'll see option to add problems:

```
📋 PROBLEM STATEMENTS
┌─────────────────────────────────┐
│ You have 0 problems             │
│                                 │
│ [+ Add Problem Statement]       │
└─────────────────────────────────┘
```

---

## How to Add Problems

### Click "Add Problem Statement"

```
┌──────────────────────────────────────────┐
│ ADD PROBLEM STATEMENT                    │
├──────────────────────────────────────────┤
│                                          │
│ Problem Title *                          │
│ [Build Weather API              ________] │
│                                          │
│ Description *                            │
│ [Create a REST API that predicts         │
│  weather patterns using ML...            │
│  ________________________]                │
│                                          │
│ Resources (links)                        │
│ [https://openweathermap.org/api ________] │
│ [https://github.com/examples    ________] │
│ [+ Add more resources]                   │
│                                          │
│        [Cancel]  [Add Problem]           │
└──────────────────────────────────────────┘
```

### Fill in Details

1. **Problem Title** (required)
   - Example: "Build Weather API"
   - Should be catchy and descriptive

2. **Description** (required)
   - Explain the problem clearly
   - Tell them what to build
   - Mention tech stack preferences

3. **Resources** (optional)
   - Links to documentation
   - Example code repositories
   - API documentation

---

## Manage Your Problems

### View All Problems

```
📋 PROBLEM STATEMENTS
┌──────────────────────────────────────────┐
│ You have 2 problems                      │
│                                          │
│ 1. Build Weather API                     │
│    [Edit] [Delete]                       │
│    ✓ 3 resources attached                │
│                                          │
│ 2. E-Commerce Platform                   │
│    [Edit] [Delete]                       │
│    ✓ 1 resource attached                 │
│                                          │
│ [+ Add Another Problem]                  │
└──────────────────────────────────────────┘
```

### Edit a Problem

**Before Start Time:**
- ✅ You can edit title
- ✅ You can edit description
- ✅ You can add/remove resources
- ✅ Changes take effect immediately

```
1. Click [Edit] next to problem
2. Update fields
3. Click [Save]
```

**After Start Time:**
- ❌ Cannot edit (button disabled)
- ❌ Cannot delete (button disabled)
- Message shows: "Problems locked after start"

### Delete a Problem

**Before Start Time:**
- ✅ You can delete problems
- ✅ Click [Delete]
- ✅ Confirm deletion
- ✅ Takes effect immediately

**After Start Time:**
- ❌ Cannot delete (button disabled)

---

## Publish Your Hackathon

### Before Publishing

**Requirements:**
- ✅ Online hackathon with ≥1 problem

```
📋 PUBLISHING
┌──────────────────────────────────────────┐
│ Your hackathon is ready to publish        │
│ ✓ Mode: Online                           │
│ ✓ Problems: 2 added                      │
│                                          │
│ [Publish Hackathon]                      │
└──────────────────────────────────────────┘
```

### What Happens If You Forget Problems?

```
❌ ERROR: Cannot Publish
"Please add at least one problem statement 
before publishing your online hackathon."

Action Required:
1. Add at least one problem
2. Then try publishing again
```

### Successfully Published

```
✅ SUCCESS
"Your hackathon has been published!"

Next:
- Students can now register
- Problems are visible to participants
- You can still edit problems (until start)
```

---

## Dashboard Alerts

### What Alerts Look Like

Your dashboard will show alerts to remind you about problems:

```
┌──────────────────────────────────────────┐
│ ⚠️  CODE CHALLENGE 2026                  │
│                                          │
│ WARNING: Problem statements not          │
│ added yet.                               │
│                                          │
│ Time until start: 23 hours               │
│ Action: Add problems before start time   │
│ [View Hackathon] [Add Problem]           │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 🔴 CODE CHALLENGE 2026                   │
│                                          │
│ CRITICAL: Hackathon cannot start         │
│ without problem statements.              │
│                                          │
│ Time until start: 45 minutes             │
│ Action: Add problems IMMEDIATELY         │
│ [View Hackathon] [Add Problem NOW]       │
└──────────────────────────────────────────┘
```

### Alert Timeline

| Time Before Start | Alert Type | Your Action |
|------------------|-----------|------------|
| 24 - 1 hour | ⚠️ Warning | Add problems soon |
| < 1 hour | 🔴 Critical | Add problems NOW |
| After start | Locked | Cannot add |

---

## Best Practices

### Problem Titles
✅ Good:
- "Build Weather API"
- "E-Commerce Platform"
- "Real-time Chat Application"
- "Image Recognition System"

❌ Bad:
- "Problem 1"
- "Task"
- "Code"
- "Challenge"

### Problem Descriptions
✅ Include:
- What to build
- Key features required
- Tech stack suggestions
- Expected output format
- Evaluation criteria

### Resources
✅ Helpful:
- API documentation
- GitHub starter repos
- Tutorial links
- Database schemas
- Deployment guides

❌ Unhelpful:
- Broken links
- Irrelevant sites
- Too many resources (keep it < 5)

---

## Common Scenarios

### Scenario 1: Last-Minute Changes
```
Situation: You need to update a problem
Solution:
1. Click [Edit] next to problem
2. Update description/resources
3. Click [Save]
4. Changes live immediately
```

### Scenario 2: Too Many Problems
```
Situation: You added 5 problems but it's too much
Solution:
1. Review each problem
2. Click [Delete] on less important ones
3. Keep 2-3 high-quality problems
4. Participants will appreciate quality over quantity
```

### Scenario 3: Forgot to Add Problems
```
Situation: Publishing soon and no problems added!
Timeline:
- If 24+ hours away: You're fine, add them tomorrow
- If < 24 hours: Add problems NOW
- If < 1 hour: URGENT - Add problems immediately
- If started: Too late - problems are locked

Action: Use [+ Add Problem Statement] immediately
```

### Scenario 4: Wrong Mode for Problems
```
Situation: Tried to add problem to offline hackathon
Error: "Problem statements can only be added to online hackathons"

Solution: Problems are ONLINE ONLY
- Online: ✅ Add as many as you want
- Offline: ❌ Not supported
- Hybrid: ❌ Not supported
```

---

## Troubleshooting

### Q: I can't add problems!
**A:** Check:
- [ ] Hackathon is in ONLINE mode
- [ ] You are the organizer
- [ ] Hackathon hasn't started yet

### Q: I can't edit problems!
**A:** Check:
- [ ] Hackathon hasn't started
- [ ] You are logged in as organizer
- [ ] Problem still exists

### Q: It won't let me publish!
**A:** Check:
- [ ] Hackathon is ONLINE mode
- [ ] You have added ≥ 1 problem
- [ ] Try again or refresh page

### Q: When are problems locked?
**A:** Once your hackathon STARTS:
- [ ] Cannot add problems
- [ ] Cannot edit problems
- [ ] Cannot delete problems
- [ ] Problems are visible to students

### Q: Can I add problems after publish?
**A:** YES! As long as BEFORE start time:
- [ ] Publish without problems ❌ (blocked)
- [ ] Add problems, then publish ✅ (works)
- [ ] Add problems after publish ✅ (works, if before start)
- [ ] Add problems after start ❌ (locked)

---

## Important Reminders

### ⚠️ Before Publishing
```
MUST HAVE:
☑️ Hackathon title
☑️ Hackathon description
☑️ Start date/time
☑️ Organizer details
☑️ AT LEAST 1 PROBLEM STATEMENT ← Don't forget!
```

### 🔔 Watch for Alerts
```
24 HOURS BEFORE START:
⚠️ Yellow warning appears
"Problem statements not added yet"
→ Add your problems now

1 HOUR BEFORE START:
🔴 Red critical alert appears
"Hackathon cannot start without problems"
→ ADD PROBLEMS IMMEDIATELY

START TIME:
🔒 Problems locked
"Cannot modify after start"
→ Time to let students solve them!
```

### 📝 Participant Experience
```
What participants see:
1. Click "Join Hackathon"
2. If online WITH problems: ✅ Can join
3. If online WITHOUT problems: ❌ "Not ready"
4. If offline/hybrid: ✅ Can join (unaffected)
```

---

## Timeline Example

```
JAN 22 (Today)
├─ 10:00 AM: Create online hackathon
│            Add 2 problem statements
│            Status: Draft
│
├─ 11:00 AM: Review problems
│            Edit descriptions
│            Add resources
│
└─ 12:00 PM: Publish hackathon
             ✅ SUCCESSFUL
             Status: Published
             Alert: None (has problems)

JAN 23
├─ 9:00 AM: Dashboard shows hack 25h away
│           ✓ No alert (has problems)
│
└─ 5:00 PM: Review participant registrations
             Students joining successfully

JAN 24 (Tomorrow)
├─ 9:00 AM: 24h to start
│           ✓ No alert (has problems)
│
└─ 11:00 PM: 1h to start
              ✓ No alert (has problems)

JAN 25
└─ 10:00 AM: HACKATHON STARTS
              🔒 Problems locked
              ✅ Participants solving
```

---

## API Integration (For Developers)

If integrating with custom frontend:

### Add Problem
```bash
POST /api/hackathons/{hackathonId}/problems
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Problem Title",
  "description": "Detailed description",
  "resources": ["link1", "link2"]
}

Response: 200 OK
{
  "success": true,
  "message": "Problem statement added successfully",
  "problemCount": 1,
  "hackathon": { ... }
}
```

### Edit Problem
```bash
PUT /api/hackathons/{hackathonId}/problems/{problemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}

Response: 200 OK
```

### Delete Problem
```bash
DELETE /api/hackathons/{hackathonId}/problems/{problemId}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Problem statement deleted successfully",
  "problemCount": 0
}
```

---

## Quick Reference

### What Can I Do?

| Action | Before Publish | After Publish | After Start |
|--------|---|---|---|
| Add problem | ✅ | ✅ | ❌ |
| Edit problem | ✅ | ✅ | ❌ |
| Delete problem | ✅ | ✅ | ❌ |
| View problem | ✅ | ✅ | ✅ |
| Publish hackathon | ✅ | ✅ | N/A |
| Students register | ❌ | ✅ | ✅ |

### Constraints

| Item | Online | Offline | Hybrid |
|------|--------|---------|--------|
| Can add problems | ✅ | ❌ | ❌ |
| Need problems to publish | ✅ | ❌ | ❌ |
| Need problems to register | ✅ | ❌ | ❌ |
| Get alerts | ✅ | ❌ | ❌ |
| Problems locked after start | ✅ | N/A | N/A |

---

## Need Help?

### Documentation
- Full Feature Docs: [PROBLEM_STATEMENT_MANAGEMENT.md]
- Quick Reference: [PROBLEM_STATEMENT_QUICK_REFERENCE.md]
- Architecture: [PROBLEM_STATEMENT_SYSTEM_ARCHITECTURE.md]

### Common Issues
- Q: "Can't add problems to offline?" 
  A: Problems are ONLINE only by design

- Q: "Problems locked forever?"
  A: Only after hackathon STARTS (not publishes)

- Q: "Can I have 0 problems?"
  A: No - online hackathons need ≥1 to publish/register

---

## Success Example

```
🎯 THE RIGHT WAY

1. JAN 22, 10 AM: Create online hackathon "Code Challenge"
2. JAN 22, 10:15 AM: Add Problem 1 "Build Weather API"
3. JAN 22, 10:30 AM: Add Problem 2 "E-Commerce Platform"
4. JAN 22, 11 AM: Publish hackathon ✅ SUCCESS
5. JAN 22, 11:15 AM: Students start registering
6. JAN 24, 10 AM: Hackathon starts → Problems locked
7. JAN 26, 10 AM: Hackathon ends ✅ COMPLETE

😞 THE WRONG WAY

1. JAN 24, 9 AM: Create online hackathon
2. JAN 24, 9:15 AM: Try to publish
   ❌ ERROR: "No problems added"
3. JAN 24, 10 AM: PANIC - Hackathon starts in 1h!
4. JAN 24, 9:45 AM: Add problem quickly
5. JAN 24, 10 AM: Too late - Problems locked
   ❌ Hackathon starts with problems ready but no time to test

LESSON: Plan ahead and add problems early!
```

---

**Status:** ✅ User Guide Complete  
**Last Updated:** January 22, 2026  
**Version:** 1.0

For technical questions, see the developer documentation.  
For support, contact your system administrator.
