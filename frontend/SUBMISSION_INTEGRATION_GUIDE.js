/**
 * ONLINEEDITOR.JSX - SUBMISSION INTEGRATION GUIDE
 * 
 * This file shows the specific changes needed to integrate the submission system
 * into OnlineEditor.jsx. Add the following imports and functions to your existing file.
 */

// ============ ADD THESE IMPORTS AT THE TOP ============
import ComplexityAnalysisModal from '../components/ComplexityAnalysisModal';
import ProblemSubmissionConfirm from '../components/ProblemSubmissionConfirm';
import HackathonSubmitModal from '../components/HackathonSubmitModal';
// (existing imports remain the same)

// ============ ADD THESE STATE HOOKS ============
const [complexityAnalysis, setComplexityAnalysis] = useState(null);
const [showComplexityModal, setShowComplexityModal] = useState(false);
const [showProblemConfirm, setShowProblemConfirm] = useState(false);
const [showHackathonSubmitModal, setShowHackathonSubmitModal] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [submittedProblems, setSubmittedProblems] = useState(new Set()); // Track submitted problem IDs
const [scoreBreakdown, setScoreBreakdown] = useState(null);

// ============ ADD THIS FUNCTION - PROBLEM SUBMISSION ============
const handleProblemSubmit = async () => {
  try {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    // First, verify all test cases pass
    if (executionStatus !== 'success') {
      alert('All test cases must pass before submitting');
      setIsSubmitting(false);
      return;
    }

    // Show "analyzing complexity..." modal
    setShowComplexityModal(true);

    // Submit to backend
    const response = await axios.post(
      `http://localhost:5000/api/hackathons/${id}/submit-problem`,
      {
        problemIndex: currentProblemIndex,
        language: language,
        solutionCode: code,
        testsPassed: true, // Since executionStatus === 'success'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      // Update complexity analysis modal with results
      setComplexityAnalysis(response.data.complexityAnalysis);
      
      // Mark problem as submitted
      setSubmittedProblems(new Set([...submittedProblems, currentProblem._id]));
      
      // Show confirmation after modal closes
      setTimeout(() => {
        setShowComplexityModal(false);
        setShowProblemConfirm(true);
      }, 2000);
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

// ============ ADD THIS FUNCTION - HACKATHON FINAL SUBMISSION ============
const handleHackathonSubmit = async () => {
  try {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    const response = await axios.post(
      `http://localhost:5000/api/hackathons/${id}/submit`,
      {
        // Backend will automatically calculate time spent
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      setScoreBreakdown(response.data.scoreBreakdown);
      alert('Hackathon submitted successfully!');
      // Redirect to leaderboard after short delay
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

// ============ UPDATE THE SUBMIT BUTTON IN JSX ============
/**
 * REPLACE THE EXISTING SUBMIT BUTTON SECTION WITH THIS:
 * 
 * Current location: Around line 1050 in OnlineEditor.jsx
 * Look for: <button ... onClick={handleSubmit} ... >Submit Solution</button>
 */

{/* REPLACE: OLD SUBMIT BUTTON */}
<div className="flex gap-2">
  <button
    onClick={handleRun}
    disabled={executing}
    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
  >
    {executing ? 'Running...' : 'Run Code'}
  </button>
  
  {/* SUBMIT PROBLEM BUTTON - Only enabled if all tests pass */}
  <button
    onClick={handleProblemSubmit}
    disabled={
      isSubmitting || 
      executionStatus !== 'success' || 
      submittedProblems.has(currentProblem._id)
    }
    className={`flex-1 font-semibold py-2 px-4 rounded transition-colors ${
      submittedProblems.has(currentProblem._id)
        ? 'bg-green-600 text-white cursor-not-allowed'
        : executionStatus === 'success'
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
    }`}
  >
    {submittedProblems.has(currentProblem._id) ? (
      <>
        <span>✓ Submitted</span>
      </>
    ) : isSubmitting ? (
      'Submitting...'
    ) : (
      'Submit Problem'
    )}
  </button>
</div>

{/* SUBMIT HACKATHON BUTTON - Show after at least one problem submitted */}
{submittedProblems.size > 0 && (
  <button
    onClick={() => setShowHackathonSubmitModal(true)}
    disabled={isSubmitting}
    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50"
  >
    {isSubmitting ? 'Submitting...' : 'Submit Hackathon'}
  </button>
)}

// ============ ADD THESE MODALS BEFORE THE CLOSING MAIN DIV ============
{/* Complexity Analysis Modal */}
<ComplexityAnalysisModal
  isOpen={showComplexityModal}
  onClose={() => setShowComplexityModal(false)}
  analysis={complexityAnalysis}
  isLoading={isSubmitting}
/>

{/* Problem Submission Confirmation */}
<ProblemSubmissionConfirm
  isOpen={showProblemConfirm}
  onClose={() => setShowProblemConfirm(false)}
  problemIndex={currentProblemIndex}
  problemTitle={currentProblem.title}
  language={language}
  testsPassed={output ? JSON.parse(output).expected ? true : false : 0}
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
  timeSpentMinutes={timeLeft ? (competitionStartTime ? (Date.now() - competitionStartTime) / 60000 : 0) : 0}
  violations={tabSwitchViolations + fullScreenViolations}
/>

// ============ COMPLETE FILE STRUCTURE ============
/*
OnlineEditor.jsx Structure After Integration:
1. Imports (add: ComplexityAnalysisModal, ProblemSubmissionConfirm, HackathonSubmitModal)
2. Component definition & useParams
3. ALL EXISTING STATE HOOKS + NEW SUBMISSION STATE HOOKS
4. ALL EXISTING FUNCTIONS
5. ADD: handleProblemSubmit() function
6. ADD: handleHackathonSubmit() function
7. ALL EXISTING useEffect hooks
8. Return JSX:
   - Fullscreen modal (existing)
   - Violation warning (existing)
   - Anti-cheat status bar (existing)
   - Header with timer (existing)
   - Main content area (existing)
   - Code editor area (existing)
   - UPDATED: Submit buttons (with new problem submit + hackathon submit)
   - ADD: ComplexityAnalysisModal component
   - ADD: ProblemSubmissionConfirm component
   - ADD: HackathonSubmitModal component
*/

// ============ EXAMPLE BACKEND RESPONSE ============
/**
 * When submitting a problem, backend returns:
 * {
 *   success: true,
 *   message: "Problem submitted successfully",
 *   complexityAnalysis: {
 *     timeComplexity: "O(n)",
 *     spaceComplexity: "O(1)",
 *     status: "accepted", // accepted, warning, or exceeded
 *     message: "Complexity is within acceptable limits",
 *     analysisTime: 45
 *   }
 * }
 * 
 * When submitting hackathon:
 * {
 *   success: true,
 *   message: "Hackathon submitted successfully",
 *   scoreBreakdown: {
 *     baseScore: 200,
 *     timeBonus: 50,
 *     violationPenalty: 10,
 *     totalScore: 240
 *   }
 * }
 */
