/**
 * ONLINEEDITOR.JSX - EXACT CODE TO ADD
 * 
 * Copy and paste these exact sections into OnlineEditor.jsx
 * Follow the location markers carefully
 */

// ========================================
// SECTION 1: ADD TO IMPORTS (Top of file)
// ========================================

import ComplexityAnalysisModal from '../components/ComplexityAnalysisModal';
import ProblemSubmissionConfirm from '../components/ProblemSubmissionConfirm';
import HackathonSubmitModal from '../components/HackathonSubmitModal';

// After existing imports like:
// import axios from 'axios'
// import Editor from '@monaco-editor/react';


// ========================================
// SECTION 2: ADD STATE HOOKS
// ========================================

// Add AFTER the existing state hooks (around line 45-65)
// Look for: const [submissionStatus, setSubmissionStatus] = useState(null)

// Submission modals state
const [complexityAnalysis, setComplexityAnalysis] = useState(null);
const [showComplexityModal, setShowComplexityModal] = useState(false);
const [showProblemConfirm, setShowProblemConfirm] = useState(false);
const [showHackathonSubmitModal, setShowHackathonSubmitModal] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [submittedProblems, setSubmittedProblems] = useState(new Set());
const [scoreBreakdown, setScoreBreakdown] = useState(null);
const [hackathonStartTime, setHackathonStartTime] = useState(null);


// ========================================
// SECTION 3: ADD FUNCTIONS (After handleSubmit)
// ========================================

// Add AFTER handleSubmit function (around line 450)

const handleProblemSubmit = async () => {
  try {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    // Verify all test cases pass
    if (executionStatus !== 'success') {
      alert('All test cases must pass before submitting');
      setIsSubmitting(false);
      return;
    }

    // Show analyzing modal
    setShowComplexityModal(true);

    // Submit to backend
    const response = await axios.post(
      `${API_URL}/hackathons/${id}/submit-problem`,
      {
        problemIndex: currentProblemIndex,
        language: language,
        solutionCode: code
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      // Update analysis results
      setComplexityAnalysis(response.data.complexityAnalysis);
      
      // Mark as submitted
      setSubmittedProblems(new Set([...submittedProblems, `problem_${currentProblemIndex}`]));
      
      // Auto-close analysis and show confirmation after 2 seconds
      setTimeout(() => {
        setShowComplexityModal(false);
        setShowProblemConfirm(true);
      }, 2000);
      
      // Save draft cleared
      saveDraft(currentProblem._id || `problem_${currentProblemIndex}`, language, code);
    } else {
      alert(response.data.message || 'Submission failed');
      setShowComplexityModal(false);
    }
  } catch (error) {
    console.error('Problem submission error:', error);
    alert('Error submitting problem: ' + error.message);
    setShowComplexityModal(false);
  } finally {
    setIsSubmitting(false);
  }
};

const handleHackathonSubmit = async () => {
  try {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    const response = await axios.post(
      `${API_URL}/hackathons/${id}/submit`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      setScoreBreakdown(response.data.scoreBreakdown);
      setShowHackathonSubmitModal(false);
      
      // Show success
      alert('🎉 Hackathon submitted successfully!\n\nRedirecting to leaderboard...');
      
      // Redirect after delay
      setTimeout(() => {
        navigate(`/hackathons/${id}/leaderboard`);
      }, 2000);
    } else {
      alert(response.data.message || 'Final submission failed');
    }
  } catch (error) {
    console.error('Hackathon submission error:', error);
    alert('Error submitting hackathon: ' + error.message);
  } finally {
    setIsSubmitting(false);
  }
};


// ========================================
// SECTION 4: INITIALIZE START TIME USEEFFECT
// ========================================

// Add this useEffect AFTER the existing useEffects (around line 650)

useEffect(() => {
  // Set hackathon start time when component mounts
  if (!hackathonStartTime) {
    const startTime = Date.now();
    setHackathonStartTime(startTime);
    console.log('⏱️ Hackathon timer started:', new Date(startTime).toLocaleTimeString());
  }
}, [hackathonStartTime]);


// ========================================
// SECTION 5: REPLACE SUBMIT BUTTON SECTION
// ========================================

// FIND AND REPLACE THIS SECTION:
// Look for the "Run Code" and "Submit Solution" buttons
// Currently around line 1050-1070

// OLD CODE (DELETE THIS):
/*
<button
  onClick={handleRun}
  disabled={executing}
  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
>
  {executing ? 'Running...' : 'Run Code'}
</button>

<button
  onClick={handleSubmit}
  disabled={executing || submissionStatus === 'submitting'}
  className={`flex-1 font-semibold py-2 px-4 rounded transition-colors ${
    submissionStatus === 'passed'
      ? 'bg-green-600 text-white'
      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
  }`}
>
  {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Solution'}
</button>
*/

// NEW CODE (REPLACE WITH THIS):
<div className="space-y-2">
  <div className="flex gap-2">
    <button
      onClick={handleRun}
      disabled={executing}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
    >
      {executing ? 'Running...' : 'Run Code'}
    </button>
    
    <button
      onClick={handleProblemSubmit}
      disabled={
        isSubmitting || 
        executionStatus !== 'success' || 
        submittedProblems.has(`problem_${currentProblemIndex}`)
      }
      className={`flex-1 font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${
        submittedProblems.has(`problem_${currentProblemIndex}`)
          ? 'bg-green-600 text-white cursor-default'
          : executionStatus === 'success'
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
      }`}
    >
      {submittedProblems.has(`problem_${currentProblemIndex}`) ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Submitted</span>
        </>
      ) : isSubmitting ? (
        'Analyzing...'
      ) : (
        'Submit Problem'
      )}
    </button>
  </div>
  
  {submittedProblems.size > 0 && (
    <button
      onClick={() => setShowHackathonSubmitModal(true)}
      disabled={isSubmitting}
      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded transition-colors"
    >
      {isSubmitting ? 'Submitting...' : `Submit Hackathon (${submittedProblems.size}/${problems.length} solved)`}
    </button>
  )}
</div>


// ========================================
// SECTION 6: ADD MODALS BEFORE CLOSING DIV
// ========================================

// Find the closing: </div> (main container div)
// Add these components BEFORE it (around line 1100-1115)

      {/* Complexity Analysis Modal */}
      <ComplexityAnalysisModal
        isOpen={showComplexityModal}
        onClose={() => {
          setShowComplexityModal(false);
          setShowProblemConfirm(true);
        }}
        analysis={complexityAnalysis}
        isLoading={isSubmitting}
      />

      {/* Problem Submission Confirmation */}
      <ProblemSubmissionConfirm
        isOpen={showProblemConfirm}
        onClose={() => {
          setShowProblemConfirm(false);
          // Clear code and move to next problem
          setCode(defaultCode[language]);
          setOutput('');
          setExecutionStatus(null);
        }}
        problemIndex={currentProblemIndex}
        problemTitle={currentProblem.title}
        language={language}
        testsPassed={1}
        totalTests={1}
        complexity={complexityAnalysis}
      />

      {/* Hackathon Final Submission Modal */}
      <HackathonSubmitModal
        isOpen={showHackathonSubmitModal}
        onClose={() => setShowHackathonSubmitModal(false)}
        onConfirm={handleHackathonSubmit}
        isLoading={isSubmitting}
        scoreBreakdown={scoreBreakdown}
        problemsSolved={submittedProblems.size}
        totalProblems={problems.length}
        timeSpentMinutes={
          hackathonStartTime 
            ? Math.round((Date.now() - hackathonStartTime) / 60000)
            : 0
        }
        violations={tabSwitchViolations + fullScreenViolations}
      />


// ========================================
// SECTION 7: OPTIONAL - ADD STYLE IMPROVEMENTS
// ========================================

// If you want to add a visual indicator showing which problems are submitted,
// Find the problem tabs section (around line 825):

// Current:
/*
{problems.map((p, idx) => (
  <button 
    key={idx}
    onClick={() => { ... }}
    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${currentProblemIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
  >
    Problem {idx + 1}
  </button>
))}
*/

// Updated with green checkmark for submitted:
{problems.map((p, idx) => (
  <button 
    key={idx}
    onClick={() => {
      if (hasUnsavedChanges && currentProblemIndex !== idx) {
        setPendingProblemIndex(idx);
        setShowSwitchWarning(true);
      } else {
        setCurrentProblemIndex(idx);
      }
    }}
    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap flex items-center gap-2 ${
      currentProblemIndex === idx 
        ? 'bg-blue-600 text-white' 
        : submittedProblems.has(`problem_${idx}`)
        ? 'bg-green-100 text-green-700 border border-green-300'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    Problem {idx + 1}
    {submittedProblems.has(`problem_${idx}`) && (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )}
  </button>
))}


// ========================================
// VERIFICATION CHECKLIST
// ========================================

/*
After adding all code, verify:

✅ All imports are at the top
✅ All state hooks are declared
✅ handleProblemSubmit() is defined
✅ handleHackathonSubmit() is defined
✅ hackathonStartTime useEffect is added
✅ Submit button section is replaced
✅ All 3 modals are added before closing div
✅ Problem tabs show green checkmarks when submitted
✅ No duplicate code
✅ No syntax errors

Test:
✅ Run code - should execute normally
✅ Click "Submit Problem" - should show complexity modal
✅ Complexity modal shows analysis
✅ Problem marked with green checkmark after modal closes
✅ "Submit Hackathon" button appears after first submission
✅ Click "Submit Hackathon" - shows score preview
✅ Agrees to terms and submits
✅ Redirects to leaderboard
✅ Leaderboard shows user rank and score
*/
