/**
 * 🧪 Groq LLM Integration - Manual Test Guide
 * 
 * Use these test cases to verify the Groq LLM integration works correctly
 */

// ============================================================
// TEST CASE 1: Pattern OK - Direct Accept (No LLM Call)
// ============================================================

const testCase1 = {
  name: "Linear Search - Pattern Analysis Passes",
  code: `
def linear_search(arr, target):
    """Find target in array - O(n) time, O(1) space"""
    for num in arr:
        if num == target:
            return True
    return False
  `,
  language: "python",
  expectedComplexity: {
    time: "O(n)",
    space: "O(1)"
  },
  expectedResult: "ACCEPT",
  expectedLLMCall: false,
  reason: "Pattern analysis detects O(n) ≤ O(n), accepts immediately"
};

// ============================================================
// TEST CASE 2: Pattern Fails, LLM Overrides
// ============================================================

const testCase2 = {
  name: "Recursive Binary Search - Pattern Fails, LLM Accepts",
  code: `
def binary_search_recursive(arr, target, left, right):
    """Binary search with recursion - Actually O(log n)"""
    if left > right:
        return -1
    
    mid = (left + right) // 2
    
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)
  `,
  language: "python",
  expectedComplexity: {
    patternAnalysis: "O(n²)",  // Pattern sees recursion
    actualComplexity: "O(log n)"  // But it's optimized
  },
  maxComplexity: "O(n)",
  expectedResult: "ACCEPT (LLM Override)",
  expectedLLMCall: true,
  expectedLLMDecision: "isFeasible: true",
  reason: "Pattern sees potential O(n²) from recursion, but LLM recognizes binary search optimization"
};

// ============================================================
// TEST CASE 3: Pattern & LLM Both Reject
// ============================================================

const testCase3 = {
  name: "Bubble Sort - Both Pattern & LLM Reject",
  code: `
def bubble_sort(arr):
    """Bubble sort - Genuinely O(n²)"""
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
  `,
  language: "python",
  constraints: {
    maxTime: "O(n)",     // Too strict for bubble sort
    maxSpace: "O(1)"
  },
  expectedComplexity: {
    time: "O(n²)",
    space: "O(1)"
  },
  expectedResult: "REJECT",
  expectedLLMCall: true,
  expectedLLMDecision: "isFeasible: false",
  llmSuggestions: [
    "Use a more efficient sorting algorithm like merge sort or quicksort",
    "Consider the problem requirements - is O(n) actually necessary?",
    "Pre-sort data if possible, or use divide-and-conquer"
  ],
  reason: "O(n²) genuinely exceeds O(n) limit, both pattern and LLM agree to reject"
};

// ============================================================
// TEST CASE 4: LLM Unavailable (No API Key)
// ============================================================

const testCase4 = {
  name: "LLM Unavailable - Fallback to Pattern",
  code: testCase3.code,
  language: "python",
  constraints: testCase3.constraints,
  environment: {
    GROQ_API_KEY: null  // Not set
  },
  expectedResult: "REJECT",
  expectedLLMCall: true,
  llmResponseStatus: "unavailable",
  fallbackBehavior: "Use pattern-based decision",
  reason: "LLM service not configured, system gracefully falls back to pattern analysis"
};

// ============================================================
// TEST CASE 5: Nested Loops with Early Termination
// ============================================================

const testCase5 = {
  name: "Optimized Nested Loop - Pattern vs LLM",
  code: `
def find_pair_with_termination(arr, target):
    """Nested loop but with early termination"""
    n = len(arr)
    for i in range(n):
        for j in range(i + 1, n):
            if arr[i] + arr[j] == target:
                return (arr[i], arr[j])
            if arr[i] + arr[j] > target:
                break  # Early termination
    return None
  `,
  language: "python",
  constraints: {
    maxTime: "O(n log n)"  // Allows log-linear
  },
  patternAnalysis: "O(n²)",  // Sees nested loops
  llmAnalysis: "O(n²)",      // But confirms nested loops
  expectedResult: "REJECT",
  expectedLLMCall: true,
  expectedLLMDecision: "isFeasible: false",
  reason: "Both agree: nested loop without early termination that actually helps exceeds limit"
};

// ============================================================
// TEST CASE 6: Recursive Fibonacci with Memoization
// ============================================================

const testCase6 = {
  name: "Fibonacci with Memoization - Pattern Fails, LLM Accepts",
  code: `
def fibonacci_memo(n, memo={}):
    """Fibonacci with memoization - O(n) despite recursion"""
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]
  `,
  language: "python",
  constraints: {
    maxTime: "O(n)"
  },
  patternAnalysis: "O(2^n)",  // Sees recursion
  actualComplexity: "O(n)",   // But memoization makes it linear
  expectedResult: "ACCEPT (LLM Override)",
  expectedLLMCall: true,
  expectedLLMDecision: "isFeasible: true",
  confidence: 0.95,
  reason: "LLM recognizes memoization pattern, overrides worst-case analysis"
};

// ============================================================
// HOW TO RUN THESE TESTS
// ============================================================

const testInstructions = `
1️⃣ Setup (One time):
   - npm install groq-sdk
   - Get API key from https://console.groq.com/keys
   - Add to .env: GROQ_API_KEY=gsk_your_key_here

2️⃣ Restart Backend:
   - npm run dev

3️⃣ Test Each Case:
   - Go to editor
   - Paste code from testCase1, testCase2, etc
   - Click "Submit Problem"
   - Check console logs and response

4️⃣ Verify Expected Behavior:
   - Test 1: Should accept immediately (5ms, no LLM)
   - Test 2: Should show LLM override acceptance
   - Test 3: Should show LLM confirmed rejection
   - Test 4: Should fall back to pattern if no LLM
   - Test 5: Should reject (both pattern & LLM)
   - Test 6: Should show LLM override on recursion

5️⃣ Check Console Logs:
   Look for messages like:
   - "🔍 Analyzing complexity..."
   - "🤖 Initiating LLM complexity validation..."
   - "✅ LLM Validation Complete:"
   - "📊 Complexity Check: ..."
`;

// ============================================================
// EXPECTED CONSOLE OUTPUT FOR TEST CASE 2
// ============================================================

const expectedConsoleOutput = `
🔍 Analyzing complexity...
📊 Complexity Analysis: {
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(n)',
  status: 'exceeded',
  message: '❌ Time complexity O(n²) exceeds limit O(n)'
}
⚠️ Pattern analysis shows complexity exceeded. Requesting LLM validation...
🤖 Sending to Groq LLM for complexity validation...
📨 Groq Response: {
  "isFeasible": true,
  "timeComplexity": "O(log n)",
  "spaceComplexity": "O(log n)",
  "meetsTimeLimit": true,
  "meetsSpaceLimit": true,
  "reasoning": "The code uses binary search with recursive calls. Each recursion...",
  "confidence": 0.92,
  "flags": []
}
✅ LLM Validation Complete: {
  isFeasible: true,
  timeComplexity: 'O(log n)',
  spaceComplexity: 'O(log n)',
  confidence: 0.92
}
✅ LLM overrides: Solution is feasible despite pattern analysis
`;

// ============================================================
// QUICK TEST VIA CURL (Backend Testing)
// ============================================================

const curlTestCommand = `
# Test problem submission with complexity validation

curl -X POST http://localhost:5000/api/hackathons/{hackathonId}/submit-problem/{problemIndex} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "language": "python",
    "solutionCode": "def linear_search(arr, target):\\n    for num in arr:\\n        if num == target:\\n            return True\\n    return False",
    "testCasesPassedCount": 5,
    "totalTestCases": 5
  }'

# Expected response:
{
  "success": true,
  "message": "Problem 1 submitted successfully!",
  "complexityAnalysis": {
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "status": "accepted"
  }
}
`;

// ============================================================
// DEBUGGING TIPS
// ============================================================

const debuggingTips = `
🐛 Debugging Tips:

1. LLM Not Called?
   - Check if GROQ_API_KEY is set in .env
   - Restart backend after setting env var
   - Check console for "GROQ_API_KEY not set" warning

2. LLM Response is NULL?
   - API rate limit (30 req/min free tier)
   - Wait a minute and try again
   - Check Groq status: https://status.groq.com

3. Wrong Complexity Detected?
   - Pattern analysis is heuristic-based
   - LLM provides more accurate analysis
   - If LLM decision seems wrong, report to Groq team

4. Slow Response Time?
   - First call: ~2-3s (includes LLM)
   - Subsequent: May use cache
   - Free tier may have latency

5. Test Code Too Long?
   - Pattern analysis takes full code
   - LLM truncates to 3000 chars
   - Longer code may give less accurate LLM analysis

6. Enable Debug Logging:
   - Set NODE_ENV=development
   - All LLM requests/responses logged
   - Check for "🤖", "📊", "✅" prefixes in console
`;

// ============================================================
// EXPORT FOR TESTING
// ============================================================

module.exports = {
  testCase1,
  testCase2,
  testCase3,
  testCase4,
  testCase5,
  testCase6,
  testInstructions,
  expectedConsoleOutput,
  curlTestCommand,
  debuggingTips
};

console.log("✅ Test cases loaded");
console.log("📋 Run: node test-cases.js to see details");
console.log(testInstructions);
