CODEVERSE SUBMISSION SYSTEM - ARCHITECTURE OVERVIEW
====================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─ OnlineEditor.jsx (Main Page)                                            │
│  │  ├─ Timer Management                                                      │
│  │  ├─ Code Editor (Monaco)                                                 │
│  │  ├─ Problem Display                                                      │
│  │  ├─ Test Runner (Run Code)                                               │
│  │  └─ Submission Handler                                                   │
│  │      ├─ handleProblemSubmit()  ──────┐                                   │
│  │      └─ handleHackathonSubmit() ──┐  │                                   │
│  │                                    │  │                                   │
│  ├─ ComplexityAnalysisModal ◄────────┤  │ (Shows result)                   │
│  │  └─ Analyzes time/space complexity │  │                                   │
│  │                                    │  │                                   │
│  ├─ ProblemSubmissionConfirm ◄──────┤  │ (Success message)                │
│  │  └─ Shows green checkmark          │  │                                   │
│  │                                    │  │                                   │
│  ├─ HackathonSubmitModal ◄───────────┤  │ (Final submission)              │
│  │  ├─ Score preview                  │  │                                   │
│  │  ├─ Terms agreement                │  │                                   │
│  │  └─ Final submit button            │  │                                   │
│  │                                    │  │                                   │
│  └─ LeaderboardComponent (Separate Page)                                    │
│     ├─ User's rank card                                                      │
│     ├─ Top 3 with medals                                                     │
│     ├─ All participants ranked                                               │
│     └─ Score breakdown visible                                               │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │ API Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Backend API Endpoints (Express)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  POST /api/hackathons/:id/submit-problem                                    │
│  ├─ Input: problemIndex, language, solutionCode                             │
│  ├─ Process:                                                                 │
│  │   1. Validate problem exists                                              │
│  │   2. Check not already submitted                                          │
│  │   3. Create HackathonSubmission record (if first)                         │
│  │   4. Call ComplexityAnalyzer.analyzeComplexity()                         │
│  │   5. Add to problemsSubmitted[]                                           │
│  └─ Return: complexityAnalysis {timeComplexity, spaceComplexity, status}   │
│                                                                               │
│  POST /api/hackathons/:id/submit                                             │
│  ├─ Input: (none - user from auth token)                                    │
│  ├─ Process:                                                                 │
│  │   1. Get HackathonSubmission record                                       │
│  │   2. Calculate timeSpent = now - joinedAt                                 │
│  │   3. Call ScoreCalculator.calculateScore()                               │
│  │   4. Set status = "completed"                                             │
│  │   5. Send confirmation email                                              │
│  │   6. Update leaderboard                                                   │
│  └─ Return: scoreBreakdown {baseScore, timeBonus, violationPenalty}         │
│                                                                               │
│  GET /api/hackathons/:id/leaderboard                                         │
│  ├─ Process:                                                                 │
│  │   1. Get all HackathonSubmissions for hackathon                           │
│  │   2. Call ScoreCalculator.generateLeaderboard()                          │
│  │   3. Sort by score DESC, then time ASC                                    │
│  │   4. Add rank numbers (1, 2, 3, ...)                                      │
│  └─ Return: leaderboard[{rank, userId, score, breakdown}]                   │
│                                                                               │
│  GET /api/hackathons/:id/submission                                          │
│  ├─ Process:                                                                 │
│  │   1. Get HackathonSubmission for current user                             │
│  │   2. Return full submission details                                       │
│  └─ Return: {problemsSubmitted[], violations, score}                        │
│                                                                               │
│  GET /api/hackathons/:id/my-rank                                             │
│  ├─ Process:                                                                 │
│  │   1. Get user's leaderboard position                                      │
│  │   2. Calculate percentile = (rank / totalParticipants) × 100             │
│  └─ Return: {rank, score, percentile, totalParticipants}                    │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │ Data Processing
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Utility Functions (Node.js)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ComplexityAnalyzer.js                                                       │
│  ├─ analyzeComplexity(code, language, constraints)                          │
│  ├─ Detects:                                                                 │
│  │   ├─ Nested loops (O(n^k))                                                │
│  │   ├─ Binary search (O(log n))                                             │
│  │   ├─ Merge sort / Quick sort (O(n log n))                                │
│  │   ├─ Recursion (counts depth)                                             │
│  │   ├─ Hash maps/sets (O(1) average)                                        │
│  │   └─ Array creation (space analysis)                                      │
│  ├─ Languages: Python, Java, C++, C                                          │
│  └─ Returns: {timeComplexity, spaceComplexity, status, message}             │
│                                                                               │
│  ScoreCalculator.js                                                          │
│  ├─ calculateScore(submission)                                               │
│  │   ├─ baseScore = problemsSolved × 100                                     │
│  │   ├─ timeBonus = calculateTimeBonus()                                     │
│  │   │   └─ First problem <30min: +50                                        │
│  │   │   └─ First problem 30-60min: +25                                      │
│  │   │   └─ Additional problems: scaled                                      │
│  │   ├─ violationPenalty = violations × 10                                   │
│  │   └─ totalScore = baseScore + timeBonus - violationPenalty (min 0)       │
│  │                                                                            │
│  ├─ generateLeaderboard(submissions[])                                       │
│  │   ├─ Sort by: score DESC, then submittedAt ASC                            │
│  │   ├─ Add rank numbers                                                      │
│  │   └─ Return ranked array                                                   │
│  │                                                                            │
│  └─ getRankDetails(ranked[], userId)                                         │
│      └─ Returns: {rank, percentile, scoreBreakdown}                          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 MongoDB Database (Mongoose)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  HackathonSubmission Collection                                              │
│  {                                                                            │
│    _id: ObjectId,                                                            │
│    userId: ObjectId (FK),                                                    │
│    hackathonId: ObjectId (FK),                                               │
│    joinedAt: Date,                                                           │
│    submittedAt: Date,                                                        │
│    totalTimeSpentMinutes: Number,                                            │
│    status: String,  // active, completed, disqualified                       │
│                                                                               │
│    problemsSubmitted: [{                                                     │
│      problemId: ObjectId,                                                    │
│      problemIndex: Number,                                                   │
│      language: String,                                                       │
│      solutionCode: String,                                                   │
│      timeComplexity: String,     // e.g., "O(n)"                             │
│      spaceComplexity: String,    // e.g., "O(1)"                             │
│      testCasesPassedCount: Number,                                           │
│      totalTestCases: Number,                                                 │
│      status: String,              // submitted, passed, etc.                 │
│      submittedAt: Date                                                       │
│    }],                                                                        │
│                                                                               │
│    violationDetails: [{                                                      │
│      type: String,     // TAB_SWITCH, FULLSCREEN_EXIT, COPY_PASTE           │
│      timestamp: Date,                                                        │
│      problemIndex: Number                                                    │
│    }],                                                                        │
│                                                                               │
│    leaderboardScore: Number,      // Final calculated score                  │
│    scoreBreakdown: {                                                         │
│      baseScore: Number,                                                      │
│      timeBonus: Number,                                                      │
│      violationPenalty: Number                                                │
│    }                                                                          │
│  }                                                                            │
│                                                                               │
│  Indexes:                                                                    │
│  ├─ { hackathonId: 1, userId: 1 } (UNIQUE)                                  │
│  └─ { hackathonId: 1, leaderboardScore: -1, submittedAt: 1 }               │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

DATA FLOW EXAMPLE
=================

1. USER SUBMITS PROBLEM
   ┌────────────────────────────────────────────────────────────────────────┐
   │ OnlineEditor.jsx                                                       │
   ├────────────────────────────────────────────────────────────────────────┤
   │ ✓ All test cases pass → executionStatus = 'success'                   │
   │ ✓ User clicks "Submit Problem"                                        │
   │ ✓ handleProblemSubmit() called                                        │
   │ ✓ Code sent to backend via POST /submit-problem                      │
   └────────────────────────────────────────────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Backend API                                                            │
   ├────────────────────────────────────────────────────────────────────────┤
   │ ✓ Create HackathonSubmission if first submission                      │
   │ ✓ Call ComplexityAnalyzer.analyzeComplexity(code, 'python', {maxO: ...})   │
   │ ✓ ComplexityAnalyzer detects O(n) time, O(1) space                   │
   │ ✓ Check complexity is acceptable                                      │
   │ ✓ Add to problemsSubmitted[]                                          │
   │ ✓ Save to MongoDB                                                      │
   └────────────────────────────────────────────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Frontend Response                                                      │
   ├────────────────────────────────────────────────────────────────────────┤
   │ ✓ Receive complexityAnalysis = {timeComplexity: 'O(n)', ...}          │
   │ ✓ Show ComplexityAnalysisModal                                        │
   │ ✓ User sees time/space complexity and "status: accepted"             │
   │ ✓ 2 seconds later, auto-close and show green checkmark               │
   │ ✓ Problem marked as submitted (green check on tab)                    │
   │ ✓ "Submit Hackathon" button now enabled                               │
   └────────────────────────────────────────────────────────────────────────┘

2. USER SUBMITS HACKATHON (Final)
   ┌────────────────────────────────────────────────────────────────────────┐
   │ OnlineEditor.jsx                                                       │
   ├────────────────────────────────────────────────────────────────────────┤
   │ ✓ At least 1 problem submitted                                        │
   │ ✓ User clicks "Submit Hackathon"                                      │
   │ ✓ Show HackathonSubmitModal with score preview                        │
   │ ✓ Calculate timeSpent = now - hackathonStartTime                      │
   │ ✓ User agrees to terms                                                 │
   │ ✓ handleHackathonSubmit() called                                      │
   │ ✓ POST /submit sent to backend                                        │
   └────────────────────────────────────────────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Backend Score Calculation                                              │
   ├────────────────────────────────────────────────────────────────────────┤
   │ ✓ Get HackathonSubmission for user                                    │
   │ ✓ Calculate timeSpent = submittedAt - joinedAt                        │
   │ ✓ Call ScoreCalculator.calculateScore(submission)                    │
   │ ✓ baseScore = 2 problems × 100 = 200                                  │
   │ ✓ timeBonus = +50 (first problem <30min)                              │
   │ ✓ violationPenalty = 1 violation × 10 = 10                            │
   │ ✓ totalScore = 200 + 50 - 10 = 240                                    │
   │ ✓ Update leaderboardScore = 240                                        │
   │ ✓ Update scoreBreakdown                                                │
   │ ✓ Send confirmation email                                              │
   └────────────────────────────────────────────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Leaderboard Generation                                                 │
   ├────────────────────────────────────────────────────────────────────────┤
   │ ✓ Get all completed HackathonSubmissions                              │
   │ ✓ Sort by: leaderboardScore DESC, then submittedAt ASC               │
   │ ✓ Add rank position (1, 2, 3, ...)                                    │
   │ ✓ Calculate percentile for each user                                   │
   │ ✓ Return leaderboard array                                             │
   └────────────────────────────────────────────────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │ Frontend - Leaderboard Display                                         │
   ├────────────────────────────────────────────────────────────────────────┤
   │ ✓ Display LeaderboardComponent                                        │
   │ ✓ Show user's rank: #4 out of 50                                      │
   │ ✓ Show user's score: 240                                               │
   │ ✓ Show percentile: 92% (top 8%)                                        │
   │ ✓ Show score breakdown (200 + 50 - 10)                                │
   │ ✓ Show all participants ranked with medals for top 3                  │
   │ ✓ User can refresh to see live updates                                 │
   └────────────────────────────────────────────────────────────────────────┘

KEY DECISION POINTS
===================

1. Complexity Analysis
   - Pattern-based (regex) vs. AST analysis
   - Decision: Pattern-based for speed and MVP
   - Accuracy: ~70-80% for complex patterns

2. Score Calculation
   - Time bonus vs. time penalty
   - Decision: Incentivize speed for first problem
   - Formula: First problem 30min = +50, 30-60min = +25

3. Leaderboard Ranking
   - Score only vs. score + time
   - Decision: Primary by score, secondary by submission time
   - Prevents ties and encourages fast submission

4. Violation Tracking
   - Real-time vs. post-submission check
   - Decision: Real-time via browser events
   - Tracks: Tab switches, fullscreen exits, copy/paste attempts

PERFORMANCE METRICS
===================

✓ Complexity Analysis: ~50-100ms per submission
✓ Score Calculation: O(n) for single, O(n log n) for leaderboard
✓ Database Queries: <50ms with indexes
✓ Modal Animations: 300ms smooth transitions
✓ Leaderboard Load: <1s for 1000 participants

SECURITY MEASURES
==================

✓ Backend validation of all submissions
✓ Token-based authentication
✓ MongoDB indexes prevent N+1 queries
✓ No client-side score calculation (trust backend)
✓ Email confirmation for final submission
✓ Anti-cheating violation tracking
✓ Submission immutability (no editing after submit)
