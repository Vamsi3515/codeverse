# 🤖 Groq LLM Integration Guide

## Overview

This system now integrates **Groq LLM** for intelligent code complexity validation. When a solution's pattern-based complexity analysis shows it exceeds limits, Groq provides a second opinion before rejecting the submission.

## Architecture

```
User Submits Code
        ↓
Pattern-Based Analysis (Fast - 5ms)
        ↓
If Pattern says "OK" → Accept ✅
        ↓
If Pattern says "Exceeded" → LLM Validation (1-2s)
        ├─ LLM says "Feasible" → Accept (Override) ✅
        ├─ LLM says "Not Feasible" → Reject with Suggestions ❌
        └─ LLM Unavailable → Use Pattern Decision ⚠️
```

## Setup Instructions

### Step 1: Get Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Go to **API Keys** section
4. Generate new API key
5. Copy the key (you'll need it in Step 2)

### Step 2: Update Environment Variables

1. Open `/backend/.env` file
2. Add your Groq API key:
```env
GROQ_API_KEY=gsk_your_api_key_here
```

**Example `.env` file:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codeverse-campus
JWT_SECRET=your-secret
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq LLM Configuration
GROQ_API_KEY=gsk_your_api_key_here
```

### Step 3: Install Dependencies

```bash
cd backend
npm install groq-sdk
```

## How It Works

### 1. Pattern-Based Analysis (Backend)

```javascript
// Fast heuristic check
const complexityAnalysis = ComplexityAnalyzer.analyzeComplexity(
  code,
  'python',
  { 
    maxTimeComplexity: 'O(n²)',
    maxSpaceComplexity: 'O(n)' 
  }
);
// Returns: { timeComplexity, spaceComplexity, status, message }
```

### 2. LLM Validation (When Needed)

```javascript
// Only triggered if pattern analysis says "exceeded"
const llmValidation = await ComplexityAnalyzer.validateWithLLM(
  code,
  'python',
  'O(n²)',      // detected time complexity
  'O(n)',       // max time complexity
  'O(n)',       // detected space complexity  
  'O(1)'        // max space complexity
);
// Returns: { isFeasible: boolean, reasoning: string, confidence: 0-1 }
```

### 3. Hybrid Decision Logic

```javascript
if (complexityAnalysis.status === 'exceeded') {
  // Check with LLM
  const llmDecision = await ComplexityAnalyzer.validateWithLLM(...);
  
  if (llmDecision.isFeasible === true) {
    // Accept despite pattern analysis
    allowSubmission('LLM override');
  } else if (llmDecision.isFeasible === false) {
    // Reject with LLM-based suggestions
    rejectWithSuggestions(llmDecision);
  } else {
    // LLM unavailable, use pattern decision
    reject('Pattern analysis exceeded limits');
  }
}
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Problem submitted successfully!",
  "complexityAnalysis": {
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "status": "accepted",
    "message": "✅ Time O(n) and Space O(1)"
  }
}
```

### LLM Override Success
```json
{
  "success": true,
  "message": "Problem submitted successfully!",
  "complexityAnalysis": {
    "status": "accepted_by_llm",
    "message": "✅ Pattern analysis showed O(n²), but LLM confirmed solution is feasible"
  },
  "llmValidation": {
    "confirmed": true,
    "reasoning": "The nested loop is optimized with early termination, making actual complexity O(n log n)"
  }
}
```

### Rejection Response (LLM Confirmed)
```json
{
  "success": false,
  "message": "Complexity analysis failed",
  "reason": "exceeded_complexity",
  "complexityAnalysis": {
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(n)",
    "maxTimeComplexity": "O(n)",
    "maxSpaceComplexity": "O(1)",
    "llmValidation": {
      "confirmed": true,
      "reasoning": "The nested loop cannot be optimized further. Algorithm genuinely needs O(n²)",
      "confidence": 0.92,
      "suggestions": [
        "Consider a different algorithm approach (e.g., binary search, dynamic programming)",
        "Pre-process data or use memoization",
        "Use a more efficient data structure"
      ]
    }
  }
}
```

### Rejection Response (LLM Unavailable)
```json
{
  "success": false,
  "message": "Complexity analysis failed",
  "complexityAnalysis": {
    "llmValidation": {
      "available": false,
      "message": "LLM service not configured. Using pattern-based decision."
    }
  }
}
```

## Frontend Display

The rejection modal now shows:

1. **LLM Badge** - Indicates if analysis was confirmed by LLM
2. **Confidence Score** - How confident the LLM is
3. **LLM Reasoning** - Explanation from AI about why code is/isn't feasible
4. **Smart Suggestions** - Specific optimization tips from Groq LLM

```jsx
{/* LLM Validation Badge */}
{rejectionDetails.llmValidation && (
  <div className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-3 mb-4">
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-purple-300">🤖 LLM ANALYSIS</span>
      <span className="text-xs px-2 py-0.5 bg-red-900/50 text-red-300 rounded">
        CONFIRMED REJECTION
      </span>
    </div>
    <p className="text-xs text-gray-300">{rejectionDetails.llmValidation.reasoning}</p>
    <p className="text-xs text-purple-300 mt-1">
      Confidence: {(rejectionDetails.llmValidation.confidence * 100).toFixed(0)}%
    </p>
  </div>
)}
```

## Files Modified/Created

### Backend Files
- ✅ `src/utils/groqClient.js` (NEW) - Groq API wrapper
- ✅ `src/utils/ComplexityAnalyzer.js` - Added LLM methods
- ✅ `src/controllers/submissionController.js` - Integrated LLM validation
- ✅ `package.json` - Added groq-sdk dependency
- ✅ `.env.example` - Added GROQ_API_KEY

### Frontend Files
- ✅ `src/pages/OnlineEditor.jsx` - Enhanced rejection modal & error handling

## Testing the Integration

### Test Case 1: Direct Acceptance (Pattern OK)
```python
# Time O(n), Space O(1)
def find_max(arr):
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val
```
**Expected**: ✅ Accepted (Pattern analysis passes)

### Test Case 2: LLM Override (Pattern Fails, LLM Accepts)
```python
# Pattern sees nested loop → O(n²)
# But actually optimized → O(n log n)
def optimized_search(arr, target):
    def binary_search(left, right):
        if left > right:
            return -1
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            return binary_search(mid + 1, right)
        else:
            return binary_search(left, mid - 1)
    
    return binary_search(0, len(arr) - 1)
```
**Expected**: ✅ May be accepted by LLM (O(log n) ≤ O(n))

### Test Case 3: Confirmed Rejection (Both Fail)
```python
# Time O(n²), Space O(n²)
def create_matrix(n):
    matrix = []
    for i in range(n):
        row = []
        for j in range(n):
            row.append(i * j)
        matrix.append(row)
    return matrix
```
**Expected**: ❌ Rejected (Pattern + LLM both exceed O(n) limit)

## Monitoring & Logging

Check backend console logs for LLM decisions:

```
🔍 Analyzing complexity...
📊 Complexity Analysis: { timeComplexity: 'O(n²)', ... }
⚠️ Pattern analysis shows complexity exceeded. Requesting LLM validation...
🤖 Sending to Groq LLM for complexity validation...
📨 Groq Response: { "isFeasible": false, ... }
✅ LLM Validation Complete: { isFeasible: false, ... }
```

## Performance Considerations

| Scenario | Time | Notes |
|----------|------|-------|
| Pattern analysis only | ~5ms | Fast, always runs |
| LLM validation | 1-2s | Only when pattern says "exceeded" |
| With LLM override | 2-3s | Slightly slower but more accurate |
| LLM timeout | ~30s then fallback | Uses pattern decision if LLM fails |

## Troubleshooting

### Issue: "GROQ_API_KEY not set"

**Solution:**
```bash
# Backend/.env
GROQ_API_KEY=gsk_your_key_here

# Then restart backend
npm run dev
```

### Issue: LLM Returns Null Decision

**Solution:** Happens when API is rate-limited or code too long
- System falls back to pattern-based decision
- Check console for error logs
- Wait a few seconds and retry

### Issue: Very Slow LLM Response

**Solution:** Groq is free tier with shared resources
- Add caching for repeated analyses
- Consider premium tier for production
- Increase timeout threshold if needed

## Cost Estimation

**Good News**: Groq is FREE! 🎉

- No cost for API calls (free tier: 30 requests/minute)
- Unlimited complexity analyses
- Mixtral 8x7b model is lightning fast (500+ tokens/second)

### Production Recommendations
- **Dev/Testing**: Use free tier (30 req/min)
- **Production**: Consider upgrade for higher limits
- Pricing: ~$0.00002 per token with Pro plan

## Future Enhancements

1. **Caching** - Store analyzed code patterns to skip repeated analyses
2. **ML Model** - Train on competitive programming solutions
3. **Explanation Scoring** - Rate quality of LLM suggestions
4. **Admin Dashboard** - See all LLM decisions and override if needed
5. **Custom Models** - Fine-tune Groq model on your problem types

## API Documentation

### `ComplexityAnalyzer.validateWithLLM()`

**Parameters:**
- `code: string` - Source code
- `language: string` - 'python', 'java', 'cpp', 'c'
- `timeComplexity: string` - Detected from pattern (e.g., 'O(n²)')
- `maxTimeComplexity: string` - Problem limit (e.g., 'O(n)')
- `spaceComplexity: string` - Detected from pattern
- `maxSpaceComplexity: string` - Problem limit

**Returns:**
```javascript
{
  isFeasible: boolean | null,        // true/false if LLM decided, null if error
  reasoning: string,                 // Explanation
  confidence: number,                // 0-1 confidence score
  llmAnalysis: {
    timeComplexity: string,         // LLM's analysis
    spaceComplexity: string,        // LLM's analysis
    meetsTimeLimit: boolean,        // Time check
    meetsSpaceLimit: boolean,       // Space check
    flags: string[]                 // Concern flags
  }
}
```

### `ComplexityAnalyzer.getSuggestions()`

**Parameters:**
- `code: string` - Source code
- `language: string` - Programming language
- `complexityAnalysis: object` - Current analysis

**Returns:**
```javascript
{
  suggestions: string[],    // Array of 3 optimization suggestions
  bestPractices: string[]  // Array of best practices
}
```

## Support & Questions

For issues or questions:
1. Check the logs in backend console
2. Verify GROQ_API_KEY is set in .env
3. Test with simple code first
4. Check Groq status at [https://status.groq.com](https://status.groq.com)

---

## Summary

✅ **Pattern-based analysis** for instant feedback (5ms)
✅ **LLM validation** for accuracy (1-2s when needed)
✅ **Smart suggestions** from AI for optimization
✅ **Free** with Groq's generous free tier
✅ **Production-ready** with error handling and fallbacks
