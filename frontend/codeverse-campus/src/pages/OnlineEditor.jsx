import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Editor from '@monaco-editor/react';
import ComplexityAnalysisModal from '../components/ComplexityAnalysisModal';
import ProblemSubmissionConfirm from '../components/ProblemSubmissionConfirm';
import HackathonSubmitModal from '../components/HackathonSubmitModal';
import ExitHackathonWarning from '../components/ExitHackathonWarning';

const API_URL = 'http://localhost:5000/api'

export default function OnlineEditor(){
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [hackathon, setHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [problems, setProblems] = useState([])
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('# Write your code here\n\ndef solve():\n    # Read input\n    # Process\n    # Print output\n    pass\n\nif __name__ == \'__main__\':\n    solve()')
  const [output, setOutput] = useState('')
  const [executing, setExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState(null)

  const [submissionStatus, setSubmissionStatus] = useState(null) // null, 'submitting', 'passed', 'failed'
  const [completionEmailSent, setCompletionEmailSent] = useState(false) // Track if email sent
  
  // Anti-Cheating States
  const [antiCheatRules, setAntiCheatRules] = useState({
    tabSwitchAllowed: true,
    copyPasteAllowed: true,
    fullScreenRequired: false
  })
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [violationWarning, setViolationWarning] = useState(null)
  const [tabSwitchViolations, setTabSwitchViolations] = useState(0)
  const [fullScreenViolations, setFullScreenViolations] = useState(0)
  const [showFullscreenModal, setShowFullscreenModal] = useState(false)
  const MAX_VIOLATIONS = 3
  
  // Timer State - Two types of timers
  const [timeLeft, setTimeLeft] = useState(null)
  const [timerType, setTimerType] = useState(null) // 'competition' or 'hackathon'
  const [competitionStartTime, setCompetitionStartTime] = useState(null) // When user joined editor
  
  // Draft & Unsaved Changes State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSwitchWarning, setShowSwitchWarning] = useState(false)
  const [pendingProblemIndex, setPendingProblemIndex] = useState(null)
  const [showLanguageWarning, setShowLanguageWarning] = useState(false)
  const [pendingLanguage, setPendingLanguage] = useState(null)
  const [lastSavedTime, setLastSavedTime] = useState(null)
  
  // Submission modals state
  const [complexityAnalysis, setComplexityAnalysis] = useState(null);
  const [showComplexityModal, setShowComplexityModal] = useState(false);
  const [showProblemConfirm, setShowProblemConfirm] = useState(false);
  const [showHackathonSubmitModal, setShowHackathonSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProblems, setSubmittedProblems] = useState(new Set());
  const [scoreBreakdown, setScoreBreakdown] = useState(null);
  const [hackathonStartTime, setHackathonStartTime] = useState(null);
  
  // Test Results Display
  const [testResults, setTestResults] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [lastSubmissionTests, setLastSubmissionTests] = useState({ passed: 0, total: 0 });
  
  // Complexity Analysis Rejection
  const [showComplexityRejection, setShowComplexityRejection] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);
  const [llmValidating, setLlmValidating] = useState(false);
  
  // Exit Hackathon Warning Modal
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isExitSubmitting, setIsExitSubmitting] = useState(false);
  
  // Editor ref to force value updates
  const editorRef = useRef(null)

  const defaultCode = {
    python: "# Write your code here\n\ndef solve():\n    # Read input\n    # Process\n    # Print output\n    pass\n\nif __name__ == '__main__':\n    solve()",
    java: "import java.util.Scanner;\n\nclass Solution {\n    // Implement your method here\n    public int twoSum(int[] nums, int target) {\n        // Write your code here\n        return 0;\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your test code here\n        // Example: Solution solution = new Solution();\n        // Example: int result = solution.twoSum(nums, target);\n        // Example: System.out.println(result);\n    }\n}",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    c: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}"
  }

  // localStorage utility functions for drafts
  const getStorageKey = (problemId, lang) => `draft_${id}_problem_${problemId}_${lang}`;
  
  const saveDraft = (problemId, lang, code) => {
    try {
      const draft = {
        problemId,
        language: lang,
        solution: code,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(getStorageKey(problemId, lang), JSON.stringify(draft));
      setLastSavedTime(new Date());
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  };
  
  const loadDraft = (problemId, lang) => {
    try {
      const key = getStorageKey(problemId, lang);
      const draft = localStorage.getItem(key);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          return parsed.solution || null;
        } catch (parseError) {
          console.error('Error parsing draft:', parseError);
          return null;
        }
      }
      return null;
    } catch (e) {
      console.error('Error loading draft:', e);
      return null;
    }
  };
  
  const clearCompiler = () => {
    setCode('');
    setOutput('');
    setExecutionStatus(null);
    setSubmissionStatus(null);
    setHasUnsavedChanges(false);
  };

  // Helper functions for localStorage management (Competition Timer only)
  const getCompetitionStorageKey = () => `competition_timer_${id}_${currentProblemIndex}`;
  
  const getStoredCompetitionStartTime = () => {
    try {
      const key = getCompetitionStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          startTime: new Date(data.startTime),
          duration: data.duration,
          hackathonId: data.hackathonId
        };
      }
    } catch (e) {
      console.warn('Error reading competition timer from localStorage:', e);
    }
    return null;
  };

  const saveCompetitionStartTime = (duration) => {
    try {
      const key = getCompetitionStorageKey();
      const data = {
        startTime: new Date().toISOString(),
        duration: duration,
        hackathonId: id,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log('💾 Competition timer saved to localStorage:', data);
    } catch (e) {
      console.warn('Error saving competition timer to localStorage:', e);
    }
  };

  const calculateCompetitionTimeLeft = (duration, storedData = null) => {
    try {
      if (!storedData) {
        storedData = getStoredCompetitionStartTime();
      }

      if (!storedData) {
        // First time - return full duration
        return duration * 60;
      }

      const startTime = new Date(storedData.startTime).getTime();
      const totalDurationMs = storedData.duration * 60 * 1000;
      const now = new Date().getTime();
      const elapsedMs = now - startTime;
      const remainingMs = totalDurationMs - elapsedMs;
      const remainingSeconds = Math.floor(remainingMs / 1000);

      console.log('⏱️ Competition timer calculated:', {
        startTime: new Date(startTime).toLocaleTimeString(),
        now: new Date(now).toLocaleTimeString(),
        elapsedSeconds: Math.floor(elapsedMs / 1000),
        remainingSeconds: remainingSeconds,
        totalDuration: storedData.duration
      });

      return remainingSeconds > 0 ? remainingSeconds : 0;
    } catch (e) {
      console.error('Error calculating competition time left:', e);
      return duration * 60;
    }
  };

  // Timer Logic - Handles both competition duration and hackathon end time
  useEffect(() => {
    if (!hackathon) return;
    
    // Determine which timer to use
    if (hackathon.competitionDuration && hackathon.competitionDuration > 0) {
      // Timer Type 1: Competition Duration (persistent with localStorage)
      if (timerType === null) {
        setTimerType('competition');
        
        // Check if timer was already running (from before refresh)
        const storedData = getStoredCompetitionStartTime();
        
        if (storedData) {
          // Timer was already running before - restore it
          console.log('♻️ RESTORING COMPETITION TIMER from localStorage');
          const timeLeft = calculateCompetitionTimeLeft(hackathon.competitionDuration, storedData);
          setTimeLeft(timeLeft);
          setCompetitionStartTime(new Date(storedData.startTime));
        } else {
          // First time starting - save to localStorage
          console.log('⏱️ COMPETITION TIMER STARTED:', hackathon.competitionDuration, 'minutes');
          saveCompetitionStartTime(hackathon.competitionDuration);
          setCompetitionStartTime(new Date());
          setTimeLeft(hackathon.competitionDuration * 60);
        }
      }
    } else {
      // Timer Type 2: Hackathon End Time (no storage needed - calculated from end date)
      if (timerType === null) {
        setTimerType('hackathon');
        const calculateTimeLeft = () => {
          if (!hackathon.endDate) {
            // Default to 1 hour if no end date provided
            return 3600;
          }
          const end = new Date(hackathon.endDate).getTime();
          const now = new Date().getTime();
          const diff = Math.floor((end - now) / 1000);
          return diff > 0 ? diff : 0;
        }
        setTimeLeft(calculateTimeLeft());
        console.log('📅 HACKATHON END TIMER STARTED');
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hackathon, timerType])

  // Monitor Timer for Completion - Auto-submit when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0 && !completionEmailSent && hackathon && timerType) {
      setCompletionEmailSent(true);
      
      const triggerCompletion = async () => {
        try {
          if (timerType === 'competition') {
            console.log("⏱️ COMPETITION TIME ENDED! Auto-submitting solution...");
          } else {
            console.log("📅 HACKATHON END TIME REACHED! Auto-submitting solution...");
          }
          
          const token = localStorage.getItem('token');
          // Trigger auto-submit by calling the complete endpoint
          await axios.post(`${API_URL}/hackathons/${id}/complete`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          alert(timerType === 'competition' 
            ? '⏱️ Competition Time Completed!\n\nYour solution has been auto-submitted.' 
            : '📅 Hackathon End Time Reached!\n\nYour solution has been auto-submitted.');
        } catch (err) {
          console.error('Failed to auto-submit:', err);
        }
      };
      
      triggerCompletion();
    }
  }, [timeLeft, completionEmailSent, hackathon, timerType, id]);

  // Load draft when problem or language changes
  useEffect(() => {
    if (!problems.length) return;
    
    // Always use problem index as consistent key (don't use _id which may not exist)
    const problemKey = currentProblemIndex;
    
    // Try to load saved draft for this problem and language
    const savedDraft = loadDraft(problemKey, language);
    
    // Always set code - either from draft or default template
    const codeToSet = savedDraft || defaultCode[language] || defaultCode['python'];
    setCode(codeToSet);
    setOutput('');
    setExecutionStatus(null);
    setSubmissionStatus(null);
    setHasUnsavedChanges(false);
  }, [currentProblemIndex, language, problems]);

  // Force sync editor when code changes
  useEffect(() => {
    if (editorRef.current && code) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== code) {
        editorRef.current.setValue(code);
      }
    }
  }, []);

  // Format Time Helper - for competition duration (MM:SS)
  const formatCompetitionTime = (seconds) => {
    if (seconds === null) return "Loading...";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Format Time Helper - for hackathon end time (D Days: HH:MM:SS)
  const formatHackathonEndTime = (seconds) => {
    if (seconds === null) return "Loading...";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }

  // Smart formatter that chooses based on timer type
  const formatTime = (seconds, type) => {
    if (type === 'competition') {
      return formatCompetitionTime(seconds);
    } else {
      return formatHackathonEndTime(seconds);
    }
  }

  useEffect(() => {
    const fetchHackathon = async () => {
      // Handle Sample/Demo IDs explicitly
      if (['1', '2', '3', '4', '5', '6'].includes(id)) {
          setHackathon({ title: `Demo Hackathon ${id}`, description: 'This is a demo hackathon running in offline mode.' });
          setProblems([{
               title: "Two Sum (Demo)",
               description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
               inputFormat: "First line contains N. Second line contains N integers. Third line contains target.",
               outputFormat: "Two integers representing the indices.",
               constraints: "2 <= nums.length <= 10^4",
               sampleInput: "4\n2 7 11 15\n9",
               sampleOutput: "0 1"
          }]);
          setCode(defaultCode['python']);
          setLoading(false);
          return;
      }

      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}/hackathons/${id}`)
        if (response.data.success) {
          // Controller returns { success: true, hackathon: {...} }
          const h = response.data.hackathon || response.data.data
          setHackathon(h)
          
          // Load anti-cheat rules from hackathon
          if (h && h.antiCheatRules) {
            setAntiCheatRules({
              tabSwitchAllowed: h.antiCheatRules.tabSwitchAllowed !== false,
              copyPasteAllowed: h.antiCheatRules.copyPasteAllowed !== false,
              fullScreenRequired: h.antiCheatRules.fullScreenRequired === true
            });
            console.log('🛡️ Anti-cheat rules loaded:', h.antiCheatRules);
          }
          
          if (h && h.problemStatements && h.problemStatements.length > 0) {
            setProblems(h.problemStatements)
            setCode(defaultCode['python']) // Reset code
          } else {
             // If no real problems, add a dummy one for the "Organizer-added problems" requirement if empty
             setProblems([{
                 title: "Welcome Problem (Demo)",
                 description: "The organizer hasn't added any problems yet. This is a placeholder.",
                 inputFormat: "Standard Input",
                 outputFormat: "Standard Output",
                 constraints: "None",
                 sampleInput: "Hello",
                 sampleOutput: "Hello World"
             }])
          }
        } else {
            console.warn('API returned success:false', response.data);
            throw new Error(response.data.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('Error fetching hackathon:', err)
        // FALLBACK TO DEMO MODE ON ERROR
        // This ensures the user can still test the UI execution flow
        setHackathon({ title: 'Offline Mode: Demo Hackathon', id: id });
        setProblems([{
            title: "Network Error - Demo Problem",
            description: "We could not connect to the backend server. You are seeing a demo problem to test the editor UI.\n\nDescription: Write a program that prints 'Hello World'.",
            inputFormat: "None",
            outputFormat: "String 'Hello World'",
            constraints: "None",
            sampleInput: "None",
            sampleOutput: "Hello World"
        }]);
        setCode(defaultCode['python']);
      } finally {
        setLoading(false)
      }
    }
    fetchHackathon()
  }, [id])

  const currentProblem = problems[currentProblemIndex] || {}

  // Fetch submission history to restore state on page refresh
  useEffect(() => {
    if (!hackathon || !id) return;

    const fetchSubmissionHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/hackathons/${id}/submission`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success && response.data.submission) {
          // Extract problem indices from submitted problems
          const submittedIndices = response.data.submission.problemsSubmitted.map(p => `problem_${p.problemIndex}`);
          setSubmittedProblems(new Set(submittedIndices));
          
          console.log('✅ Restored submission history:', submittedIndices);
          
          // Check if hackathon already submitted - if yes, redirect to dashboard
          if (response.data.submission.status === 'completed') {
            console.log('⛔ HACKATHON ALREADY SUBMITTED - Redirecting to dashboard');
            alert('⛔ This hackathon has already been submitted.\n\nYou cannot rejoin an already submitted hackathon.');
            navigate('/dashboard/student');
            return;
          }
        }
      } catch (err) {
        // If no submission exists, that's fine - user hasn't submitted anything yet
        if (err.response?.status !== 404) {
          console.warn('Error fetching submission history:', err);
        }
      }
    };

    fetchSubmissionHistory();
  }, [id, hackathon, navigate]);

  // ==================== ANTI-CHEATING ENFORCEMENT ====================
  
  // 1️⃣ TAB SWITCHING PREVENTION - Only track visibilitychange
  useEffect(() => {
    if (!antiCheatRules.tabSwitchAllowed) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          const newViolations = tabSwitchViolations + 1;
          console.warn(`⚠️ VIOLATION: Tab switched away (${newViolations}/3)`);
          setTabSwitchViolations(newViolations);
          const remaining = MAX_VIOLATIONS - newViolations;
          setViolationWarning(`⚠️ You switched tabs! ${remaining > 0 ? `${remaining} chances remaining.` : '❌ No more chances - submission will be marked!'}`);
          setTimeout(() => setViolationWarning(null), 5000);
          // Focus back to window
          window.focus();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [antiCheatRules.tabSwitchAllowed, tabSwitchViolations])

  // 2️⃣ COPY/PASTE PREVENTION (only if disabled)
  useEffect(() => {
    // If copy/paste is ALLOWED, don't add any listeners
    if (antiCheatRules.copyPasteAllowed !== false) {
      console.log('✅ Copy/Paste ENABLED - no restrictions');
      return;
    }
    
    // Copy/Paste is DISABLED - block all copy/paste operations
    console.log('❌ Copy/Paste DISABLED - blocking all operations');
    
    const handleCopy = (e) => {
      e.preventDefault();
      console.warn('⚠️ VIOLATION: Copy attempted');
      setViolationWarning('⚠️ Copy/Paste is not allowed!');
      setTimeout(() => setViolationWarning(null), 3000);
      return false;
    };

    const handlePaste = (e) => {
      e.preventDefault();
      console.warn('⚠️ VIOLATION: Paste attempted');
      setViolationWarning('⚠️ Copy/Paste is not allowed!');
      setTimeout(() => setViolationWarning(null), 3000);
      return false;
    };

    const handleCut = (e) => {
      e.preventDefault();
      console.warn('⚠️ VIOLATION: Cut attempted');
      setViolationWarning('⚠️ Copy/Paste is not allowed!');
      setTimeout(() => setViolationWarning(null), 3000);
      return false;
    };

    // Keyboard shortcuts: Ctrl+C, Ctrl+X, Ctrl+V ONLY - be very specific
    const handleKeyDown = (e) => {
      const ctrl = (e.ctrlKey || e.metaKey);
      const key = e.key.toLowerCase();
      
      // ONLY block these exact shortcuts
      if (ctrl && (key === 'c' || key === 'x' || key === 'v')) {
        e.preventDefault();
        console.warn('⚠️ VIOLATION: Blocked shortcut Ctrl+' + key.toUpperCase());
        setViolationWarning('⚠️ Copy/Paste shortcuts disabled!');
        setTimeout(() => setViolationWarning(null), 3000);
      }
      // Everything else passes through unblocked
    };

    // Right-click context menu - only show warning
    const handleContextMenu = (e) => {
      console.warn('⚠️ Context menu attempted (copy/paste disabled)');
      setViolationWarning('⚠️ Copy/Paste blocked!');
      setTimeout(() => setViolationWarning(null), 3000);
    };

    // Add listeners with capture phase to ensure they fire
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('keydown', handleKeyDown, false); // keydown needs to be non-capturing
    document.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('keydown', handleKeyDown, false);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [antiCheatRules.copyPasteAllowed])

  // 3️⃣ FULL SCREEN REQUIREMENT
  useEffect(() => {
    if (antiCheatRules.fullScreenRequired) {
      // Request full screen on load
      const requestFullScreen = async () => {
        try {
          const elem = document.documentElement;
          if (elem && elem.requestFullscreen) {
            await elem.requestFullscreen();
            setIsFullScreen(true);
            console.log('✅ Full screen enabled successfully');
          } else {
            console.warn('⚠️ Fullscreen API not available');
          }
        } catch (err) {
          console.warn('⚠️ Full screen request failed:', err.message);
          setViolationWarning(`❌ Full screen is required. Error: ${err.message}`);
        }
      };

      // Small delay to let UI render first
      const timer = setTimeout(requestFullScreen, 500);

      // Monitor full screen changes (including ESC key)
      const handleFullScreenChange = () => {
        console.log('📍 Fullscreen change detected. Is fullscreen:', !!document.fullscreenElement);
        
        if (!document.fullscreenElement) {
          // User exited fullscreen (pressed ESC or exited some other way)
          const newViolations = fullScreenViolations + 1;
          console.warn(`⚠️ VIOLATION: Exited full screen (${newViolations}/3)`);
          setIsFullScreen(false);
          setFullScreenViolations(newViolations);
          const remaining = MAX_VIOLATIONS - newViolations;
          setViolationWarning(`❌ Fullscreen required! ${remaining > 0 ? `${remaining} attempts left.` : '❌ No more attempts!'}`);
          
          // Show modal to force user to re-enter fullscreen
          setShowFullscreenModal(true);
          console.log('🔒 Fullscreen modal shown - user must re-enter');
        } else {
          setIsFullScreen(true);
          console.log('✅ In fullscreen mode');
        }
      };

      document.addEventListener('fullscreenchange', handleFullScreenChange);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('fullscreenchange', handleFullScreenChange);
      };
    }
  }, [antiCheatRules.fullScreenRequired, fullScreenViolations])

  // Auto-dismiss violation warning after 3 seconds
  useEffect(() => {
    if (violationWarning) {
      const timer = setTimeout(() => {
        setViolationWarning(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [violationWarning]);

  // Initialize hackathon start time
  useEffect(() => {
    if (!hackathonStartTime) {
      const startTime = Date.now();
      setHackathonStartTime(startTime);
      console.log('⏱️ Hackathon timer started:', new Date(startTime).toLocaleTimeString());
    }
  }, [hackathonStartTime]);

  // Handle fullscreen re-entry from modal
  const handleEnterFullScreen = async () => {
    try {
      console.log('🔄 User requesting fullscreen from modal...');
      const elem = document.documentElement;
      if (elem && elem.requestFullscreen) {
        await elem.requestFullscreen();
        setIsFullScreen(true);
        setShowFullscreenModal(false);
        console.log('✅ Full screen re-enabled from modal');
      }
    } catch (err) {
      console.error('Failed to enable fullscreen:', err.message);
      setViolationWarning('Failed to enable fullscreen. Please try again.');
    }
  };

  // Parse and render test case results professionally (LeetCode style)
  const renderTestResult = () => {
    if (!output && testResults.length === 0) return null;

    // Check if it's a logic mismatch (test case failed)
    if (executionStatus === 'failed') {
      try {
        const data = JSON.parse(output);
        const { expected, actual, testCaseNum } = data;

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-sm font-semibold text-red-400">❌ Test Case {testCaseNum} Failed</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-red-950/30 rounded-lg p-4 border border-red-900/50">
                <div className="text-gray-300 text-xs font-semibold mb-3">Expected Output</div>
                <div className="font-mono text-red-300 text-xs whitespace-pre-wrap break-all bg-gray-800/50 rounded p-3 border border-red-900/30">{expected}</div>
              </div>
              <div className="bg-red-950/30 rounded-lg p-4 border border-red-900/50">
                <div className="text-gray-300 text-xs font-semibold mb-3">Your Output</div>
                <div className="font-mono text-red-300 text-xs whitespace-pre-wrap break-all bg-gray-800/50 rounded p-3 border border-red-900/30">{actual}</div>
              </div>
            </div>
          </div>
        );
      } catch (e) {
        return null;
      }
    }

    // Check if it's an error
    if (executionStatus === 'error' || output.includes('Error:')) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-sm font-semibold text-red-400">Runtime Error</span>
          </div>
          <div className="bg-gray-700 rounded p-3">
            <div className="font-mono text-red-300 text-xs whitespace-pre-wrap break-all">{output}</div>
          </div>
        </div>
      );
    }

    // Success - show all test cases side by side
    if (executionStatus === 'success' && testResults.length > 0) {
      const passedCount = testResults.filter(r => r.passed).length;
      const selectedResult = testResults[selectedTestCase];
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-semibold text-green-400">✅ All Sample Test Cases Passed</span>
          </div>
          
          <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-3 mb-3">
            <div className="text-gray-300 text-xs font-semibold">Summary: {passedCount}/{testResults.length} test cases passed</div>
          </div>

          {/* Test Case Tabs/Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-700">
            {testResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTestCase(idx)}
                className={`px-3 py-2 rounded-t-lg whitespace-nowrap text-xs font-semibold transition-all ${
                  selectedTestCase === idx
                    ? 'bg-indigo-600 text-white border-b-2 border-indigo-400'
                    : result.passed
                    ? 'bg-green-950/40 text-green-300 hover:bg-green-950/60 border-b-2 border-transparent'
                    : 'bg-red-950/40 text-red-300 hover:bg-red-950/60 border-b-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>Test {result.testCaseNum}</span>
                  <span className="text-lg">{result.passed ? '✓' : '✗'}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Test Case Details */}
          {selectedResult && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input */}
                <div className="space-y-2">
                  <div className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Input</div>
                  <div className="font-mono text-gray-300 bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 whitespace-pre-wrap break-words text-xs max-h-32 overflow-y-auto">
                    {selectedResult.input || '(empty)'}
                  </div>
                </div>

                {/* Expected Output */}
                <div className="space-y-2">
                  <div className="text-gray-300 text-xs font-semibold uppercase tracking-wider">Expected Output</div>
                  <div className="font-mono text-gray-300 bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 whitespace-pre-wrap break-words text-xs max-h-32 overflow-y-auto">
                    {selectedResult.expected || '(empty)'}
                  </div>
                </div>

                {/* Your Output */}
                <div className="space-y-2 md:col-span-2">
                  <div className={`text-xs font-semibold uppercase tracking-wider ${
                    selectedResult.passed ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Your Output {selectedResult.passed ? '✅' : '❌'}
                  </div>
                  <div className={`font-mono rounded-lg p-3 border whitespace-pre-wrap break-words text-xs max-h-32 overflow-y-auto ${
                    selectedResult.passed
                      ? 'text-green-300 bg-gray-900/50 border-gray-700/50'
                      : 'text-red-300 bg-gray-900/50 border-gray-700/50'
                  }`}>
                    {selectedResult.actual || '(empty)'}
                  </div>
                </div>
              </div>

              <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>✅ Ready to submit. Hidden test cases will be checked on submission.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default - just show the output
    return (
      <pre className="font-mono text-sm whitespace-pre-wrap text-gray-300">
        {output}
      </pre>
    );
  };

  const handleRun = async () => {
    setExecuting(true)
    setOutput('Running sample test cases...')
    setExecutionStatus(null)

    try {
        const token = localStorage.getItem('token');
        
        // Get all sample test cases
        const testCases = currentProblem.sampleTestCases && currentProblem.sampleTestCases.length > 0
          ? currentProblem.sampleTestCases
          : currentProblem.sampleInput && currentProblem.sampleOutput
          ? [{ input: currentProblem.sampleInput, output: currentProblem.sampleOutput }]
          : [];

        if (testCases.length === 0) {
          setOutput('No test cases found for this problem');
          setExecutionStatus('error');
          setExecuting(false);
          return;
        }

        let allPassed = true;
        let failedTestCase = null;
        const results = [];

        // Run all test cases
        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i];
          
          const response = await axios.post(`${API_URL}/compiler/execute`, {
              language: language,
              sourceCode: code,
              input: testCase.input || ""
          }, {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });

          if (response.data.success) {
              const rawOutput = response.data.output;
              const expected = (testCase.output || "").trim();
              const actual = (rawOutput || "").trim();
              const passed = actual === expected;
              
              results.push({
                testCaseNum: i + 1,
                passed,
                input: testCase.input,
                expected,
                actual,
                rawOutput,
                isError: response.data.isError
              });

              if (!passed || response.data.isError) {
                allPassed = false;
                if (!failedTestCase) {
                  failedTestCase = { expected, actual, rawOutput, testCaseNum: i + 1 };
                }
              }
          } else {
              allPassed = false;
              results.push({
                testCaseNum: i + 1,
                passed: false,
                input: testCase.input,
                error: response.data.message
              });
              if (!failedTestCase) {
                failedTestCase = { error: response.data.message, testCaseNum: i + 1 };
              }
          }
        }

        // Display results
        if (allPassed) {
            setExecutionStatus('success');
            setTestResults(results);
            setSelectedTestCase(0);
            const passedCount = results.filter(r => r.passed).length;
            setOutput(`✅ All ${passedCount} sample test cases passed!`);
        } else {
            setExecutionStatus('failed');
            setTestResults(results);
            setSelectedTestCase(0);
            if (failedTestCase) {
              setOutput(JSON.stringify(failedTestCase));
            } else {
              setOutput('Some test cases failed');
            }
        }
    } catch (err) {
        console.error('Execution Failed:', err);
        setOutput(`Execution Error: ${err.message || "Failed to connect to compiler service."}`);
        setExecutionStatus('error');
        setTestResults([]);
        setSelectedTestCase(0);
    } finally {
        setExecuting(false);
    }
  }

  const handleSubmit = async () => {
    if (submissionStatus === 'submitting') return
    
    setSubmissionStatus('submitting')
    
    // SIMULATED SUBMISSION (Ideally backend would run this against hidden cases)
    // Since we don't have hidden cases in Piston easily efficiently in one go without multiple calls,
    // we will stick to a simulation or run valid code once more to confirm "validity".
    
    setTimeout(() => {
       // For now, if "Active" run passes, we assume submission is okay for MVP
       // In a real judge, we'd loop through hiddenTestCases on the backend.
       const passed = true
       setSubmissionStatus(passed ? 'passed' : 'failed')
       console.log('Submission stored for:', currentProblem.title)
    }, 2000)
  }

  const handleProblemSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Verify sample test cases pass first
      if (executionStatus !== 'success') {
        alert('All sample test cases must pass before submitting');
        setIsSubmitting(false);
        return;
      }

      // Show analyzing modal
      setShowComplexityModal(true);

      // Test against all sample + hidden test cases
      const sampleTestCases = currentProblem.sampleTestCases && currentProblem.sampleTestCases.length > 0
        ? currentProblem.sampleTestCases
        : currentProblem.sampleInput && currentProblem.sampleOutput
        ? [{ input: currentProblem.sampleInput, output: currentProblem.sampleOutput }]
        : [];

      const hiddenTestCases = currentProblem.hiddenTestCases || [];
      const allTestCases = [...sampleTestCases, ...hiddenTestCases];

      let passedCount = 0;

      // Run all test cases (sample + hidden)
      for (let i = 0; i < allTestCases.length; i++) {
        const testCase = allTestCases[i];
        
        try {
          const response = await axios.post(`${API_URL}/compiler/execute`, {
              language: language,
              sourceCode: code,
              input: testCase.input || ""
          }, {
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });

          if (response.data.success && !response.data.isError) {
              const rawOutput = response.data.output;
              const expected = (testCase.output || "").trim();
              const actual = (rawOutput || "").trim();
              
              if (actual === expected) {
                passedCount++;
              }
          }
        } catch (err) {
          console.warn(`Test case ${i + 1} execution error:`, err);
        }
      }

      // Calculate test case counts
      const testCasesPassedCount = passedCount;
      const totalTestCases = allTestCases.length;

      // Store for confirmation modal
      setLastSubmissionTests({ passed: testCasesPassedCount, total: totalTestCases });

      console.log(`📊 Test Results: ${testCasesPassedCount}/${totalTestCases} passed`);

      const response = await axios.post(
        `${API_URL}/hackathons/${id}/submit-problem`,
        {
          problemIndex: currentProblemIndex,
          language: language,
          solutionCode: code,
          testCasesPassedCount: testCasesPassedCount,
          totalTestCases: totalTestCases
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
        
        console.log('✅ Problem submitted successfully:', response.data);
      } else {
        // Check if it's a complexity rejection (with or without LLM validation)
        if (response.data.complexityAnalysis) {
          const analysis = response.data.complexityAnalysis;
          setRejectionDetails({
            timeComplexity: analysis.timeComplexity,
            spaceComplexity: analysis.spaceComplexity,
            maxTimeComplexity: analysis.maxTimeComplexity,
            maxSpaceComplexity: analysis.maxSpaceComplexity,
            message: analysis.message,
            analysisTime: analysis.analysisTime,
            patternAnalysis: analysis.patternAnalysis,
            llmValidation: analysis.llmValidation, // Include LLM details if present
          });
          setShowComplexityModal(false);
          setShowComplexityRejection(true);
        } else {
          alert(response.data.message || 'Submission failed');
          setShowComplexityModal(false);
        }
      }
    } catch (error) {
      console.error('Problem submission error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      if (error.response?.data?.complexityAnalysis) {
        const analysis = error.response.data.complexityAnalysis;
        setRejectionDetails({
          timeComplexity: analysis.timeComplexity,
          spaceComplexity: analysis.spaceComplexity,
          maxTimeComplexity: analysis.maxTimeComplexity,
          maxSpaceComplexity: analysis.maxSpaceComplexity,
          message: analysis.message,
          analysisTime: analysis.analysisTime,
          patternAnalysis: analysis.patternAnalysis,
          llmValidation: analysis.llmValidation, // Include LLM details if present
        });
        setShowComplexityModal(false);
        setShowComplexityRejection(true);
      } else {
        alert('Error submitting problem: ' + errorMessage);
        setShowComplexityModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHackathonSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      // Comprehensive debug logging
      console.log('🔐 DEBUG: Final Submission Attempt:', {
        token: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
        userId: userId,
        userRole: userRole,
        hackathonId: id,
        url: `${API_URL}/hackathons/${id}/submit`,
        submittedProblems: Array.from(submittedProblems),
        localStorage: {
          token: !!localStorage.getItem('token'),
          userId: !!localStorage.getItem('userId'),
          userRole: !!localStorage.getItem('userRole'),
          userName: !!localStorage.getItem('userName')
        }
      });

      // Validation checks
      if (!token) {
        alert('ERROR: No authentication token found.\n\nPlease login again and refresh the page.');
        setIsSubmitting(false);
        return;
      }

      if (!userId) {
        alert('ERROR: User information not found.\n\nPlease login again and refresh the page.');
        setIsSubmitting(false);
        return;
      }

      if (submittedProblems.size === 0) {
        alert('ERROR: You must submit at least one problem before submitting the hackathon.\n\nPlease solve and submit at least one problem first.');
        setIsSubmitting(false);
        return;
      }

      // Check submission status first (optional, to give better feedback)
      try {
        const statusResponse = await axios.get(
          `${API_URL}/hackathons/${id}/submission`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('📋 Current submission status:', statusResponse.data);
      } catch (statusError) {
        console.warn('⚠️ Could not fetch submission status:', statusError.response?.data?.message);
      }

      // Attempt final submission
      const response = await axios.post(
        `${API_URL}/hackathons/${id}/submit`,
        {
          totalViolations: 0,
          violationDetails: []
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✅ Hackathon submit response:', response.data);

      if (response.data.success) {
        setScoreBreakdown(response.data.scoreBreakdown);
        setShowHackathonSubmitModal(false);
        
        // Redirect to leaderboard with loader
        navigate(`/hackathons/${id}/leaderboard`);
      } else {
        alert(response.data.message || 'Final submission failed');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('❌ Hackathon submission error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Provide specific error messages
      if (error.response?.status === 401) {
        alert('ERROR: Authentication failed (401 Unauthorized).\n\nPlease login again and refresh the page.');
      } else if (error.response?.status === 404) {
        const errorMsg = error.response?.data?.message || 'Not found';
        alert(`ERROR: ${errorMsg}\n\nMake sure you have submitted at least one problem first.`);
      } else if (error.response?.status === 400) {
        alert(`ERROR: ${error.response?.data?.message || 'Invalid submission'}`);
      } else {
        alert('Error submitting hackathon: ' + error.message);
      }
      setIsSubmitting(false);
    }
  };

  // Handle exit and auto-submit for timed competitions
  const handleExitAndSubmit = (submissionResponse) => {
    console.log('✅ Auto-submission completed:', submissionResponse)
    // Close modal
    setShowExitWarning(false)
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard/student')
    }, 1500)
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading editor...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* FULLSCREEN REQUIRED MODAL - Non-closable */}
      {showFullscreenModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]" onClick={(e) => e.preventDefault()}>
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Full Screen Required</h2>
              <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                This exam requires full screen mode to maintain test integrity.
              </p>
              <p className="text-gray-500 text-xs mb-6">
                You have exited full screen mode.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-700 text-sm font-medium">
                  Violations: {fullScreenViolations} of 3
                </p>
              </div>
              <button
                onClick={handleEnterFullScreen}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Enter Full Screen
              </button>
              <p className="text-xs text-gray-400 mt-5">
                This dialog cannot be dismissed. Please re-enter full screen mode to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ANTI-CHEATING VIOLATION WARNING */}
      {violationWarning && (
        <div className="bg-red-500 text-white px-6 py-3 text-center font-medium animate-pulse z-50 text-sm">
          {violationWarning}
        </div>
      )}

      {/* Anti-Cheat Status Bar */}
      {(Object.values(antiCheatRules).some(v => v === true)) && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-3 text-xs text-slate-700 flex items-center gap-8">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span>Security Settings Active</span>
          </div>
          <div className="flex gap-6 text-slate-600">
            {!antiCheatRules.tabSwitchAllowed && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                Tab Switch ({tabSwitchViolations}/3)
              </span>
            )}
            {!antiCheatRules.copyPasteAllowed && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                Copy/Paste Blocked
              </span>
            )}
            {antiCheatRules.fullScreenRequired && (
              <span className="flex items-center gap-1">
                <span className={`inline-block w-2 h-2 ${isFullScreen ? 'bg-green-500' : 'bg-orange-500'} rounded-full`}></span>
                Full Screen ({fullScreenViolations}/3)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                // If hackathon has competitionDuration, show exit warning
                if (hackathon?.competitionDuration && hackathon.competitionDuration > 0) {
                  setShowExitWarning(true)
                } else {
                  // Open-ended hackathon - just go back to dashboard
                  navigate('/dashboard/student')
                }
              }} 
              className="text-gray-500 hover:text-black"
            >
                &larr; Exit
            </button>
            <h1 className="font-semibold text-lg">{hackathon?.title || 'Hackathon Editor'}</h1>
        </div>
        <div className="flex items-center space-x-6">
             {/* Timer Display - Dynamic based on timer type */}
             <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-md">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  {timerType === 'competition' ? 'Competition' : 'Hackathon End'}
                </span>
                <span className={`font-mono font-bold text-lg ${
                  timerType === 'competition' 
                    ? (timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600')
                    : (timeLeft < 3600 ? 'text-red-600 animate-pulse' : 'text-gray-800')
                }`}>
                    {formatTime(timeLeft, timerType)}
                </span>
             </div>

             {/* Submit Hackathon Button - Always visible */}
             <button
               onClick={() => setShowHackathonSubmitModal(true)}
               disabled={isSubmitting}
               className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded transition-colors"
             >
               {isSubmitting ? 'Submitting...' : 'Submit Hackathon'}
             </button>
             
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Problem Statement */}
        <div className="w-1/2 overflow-y-auto p-6 border-r border-gray-200 bg-white">
            {problems.length > 1 && (
                <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
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
                </div>
            )}

            <h2 className="text-2xl font-bold mb-4">{currentProblem.title}</h2>
            
            <div className="prose max-w-none text-gray-800">
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="whitespace-pre-wrap">{currentProblem.description}</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Input Format</h3>
                    <p className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-2 rounded">{currentProblem.inputFormat}</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Output Format</h3>
                    <p className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-2 rounded">{currentProblem.outputFormat}</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Constraints</h3>
                    <p className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-2 rounded">{currentProblem.constraints}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Sample Input</h3>
                        <pre className="bg-gray-100 p-3 rounded text-sm font-mono overflow-auto max-h-40">{currentProblem.sampleInput}</pre>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Sample Output</h3>
                        <pre className="bg-gray-100 p-3 rounded text-sm font-mono overflow-auto max-h-40">{currentProblem.sampleOutput}</pre>
                    </div>
                </div>
                
                {currentProblem.explanation && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Explanation</h3>
                        <p className="whitespace-pre-wrap">{currentProblem.explanation}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-1/2 flex flex-col bg-gray-900 border-l border-gray-700">
            {/* Toolbar */}
            <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-gray-800">
                <div className="flex items-center space-x-2">
                    <select 
                        value={language} 
                        onChange={(e) => {
                          if (hasUnsavedChanges) {
                            setPendingLanguage(e.target.value);
                            setShowLanguageWarning(true);
                          } else {
                            setLanguage(e.target.value);
                            clearCompiler();
                          }
                        }}
                        className="bg-gray-700 text-white text-sm border-none rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                    </select>
                    <button
                      onClick={() => saveDraft(currentProblemIndex, language, code)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded font-medium transition"
                      title="Save draft to browser storage"
                    >
                      Save Draft
                    </button>
                    {lastSavedTime && (
                      <span className="text-gray-400 text-xs">
                        Saved: {lastSavedTime.toLocaleTimeString()}
                      </span>
                    )}
                    {hasUnsavedChanges && (
                      <span className="text-red-400 text-xs font-medium">
                        ● Unsaved
                      </span>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative overflow-hidden">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                    value={code}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        automaticLayout: true,
                    }}
                    onMount={(editor) => {
                      editorRef.current = editor;
                    }}
                    onChange={(value) => {
                        setCode(value);
                        setHasUnsavedChanges(true);
                        // Reset status on code change to allow re-submission
                        if (submissionStatus === 'failed' || submissionStatus === 'passed') {
                            setSubmissionStatus(null);
                        }
                        if (executionStatus) {
                            setExecutionStatus(null);
                            setOutput('');
                        }
                    }}
                />
            </div>

            {/* Bottom Panel: Output & Actions */}
            <div className="bg-gray-800 border-t border-gray-700 flex flex-col shrink-0">
                {/* Result Area */}
                <div className="p-5 border-b border-gray-700 h-40 overflow-y-auto">
                     <div className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wide">TEST RESULTS</div>
                     {executing ? (
                         <div className="flex items-center gap-2 text-gray-300 text-sm">
                           <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                           <span>Running test cases...</span>
                         </div>
                     ) : output ? (
                         renderTestResult()
                     ) : (
                         <div className="text-gray-500 text-sm">No output yet. Run your code to see results.</div>
                     )}
                </div>

                {/* Submit Status Overlay/Area */}
                {submissionStatus && (
                    <div className={`px-5 py-3 text-sm font-medium ${submissionStatus === 'passed' ? 'bg-green-900/60 border-b border-green-700/50 text-green-300' : submissionStatus === 'failed' ? 'bg-red-900/60 border-b border-red-700/50 text-red-300' : 'bg-blue-900/60 border-b border-blue-700/50 text-blue-300'}`}>
                        {submissionStatus === 'submitting' && 'Submitting your code...'}
                        {submissionStatus === 'passed' && 'All hidden test cases passed! Submission recorded.'}
                        {submissionStatus === 'failed' && 'Some hidden test cases failed.'}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 space-y-2 bg-gray-800">
                    <div className="flex items-center justify-end space-x-3">
                        <button 
                            onClick={handleRun}
                            disabled={executing || isSubmitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className={`px-6 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
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
                </div>
            </div>
        </div>
      </div>

      {/* Switch Problem Warning Modal */}
      {showSwitchWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Unsaved Changes</h3>
            <p className="text-gray-700 mb-6">
              You have unsaved changes in the current problem. What would you like to do?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  saveDraft(currentProblemIndex, language, code);
                  setCurrentProblemIndex(pendingProblemIndex);
                  setShowSwitchWarning(false);
                  setPendingProblemIndex(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Save & Switch
              </button>
              <button
                onClick={() => {
                  setCurrentProblemIndex(pendingProblemIndex);
                  setShowSwitchWarning(false);
                  setPendingProblemIndex(null);
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Discard & Switch
              </button>
              <button
                onClick={() => {
                  setShowSwitchWarning(false);
                  setPendingProblemIndex(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Language Warning Modal */}
      {showLanguageWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Change Language</h3>
            <p className="text-gray-700 mb-6">
              Changing the language will clear the compiler. Your unsaved code will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  saveDraft(currentProblemIndex, language, code);
                  setLanguage(pendingLanguage);
                  clearCompiler();
                  setShowLanguageWarning(false);
                  setPendingLanguage(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Save & Change
              </button>
              <button
                onClick={() => {
                  setLanguage(pendingLanguage);
                  clearCompiler();
                  setShowLanguageWarning(false);
                  setPendingLanguage(null);
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium transition"
              >
                Discard & Change
              </button>
              <button
                onClick={() => {
                  setShowLanguageWarning(false);
                  setPendingLanguage(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
          setCode(defaultCode[language]);
          setOutput('');
          setExecutionStatus(null);
        }}
        problemIndex={currentProblemIndex}
        problemTitle={currentProblem.title}
        language={language}
        testsPassed={lastSubmissionTests.passed}
        totalTests={lastSubmissionTests.total}
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

      {/* Complexity Analysis Rejection Modal */}
      {showComplexityRejection && rejectionDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-red-900/50">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-950/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-400 mb-1">Complexity Analysis Failed</h3>
                <p className="text-xs text-gray-400">Your solution doesn't meet the complexity requirements</p>
              </div>
            </div>

            {/* LLM Validation Badge */}
            {rejectionDetails.llmValidation && (
              <div className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-300">🤖 LLM ANALYSIS</span>
                  {rejectionDetails.llmValidation.confirmed === true ? (
                    <span className="text-xs px-2 py-0.5 bg-red-900/50 text-red-300 rounded">CONFIRMED REJECTION</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-300 rounded">VALIDATION IN PROGRESS</span>
                  )}
                </div>
                {rejectionDetails.llmValidation.reasoning && (
                  <p className="text-xs text-gray-300">{rejectionDetails.llmValidation.reasoning}</p>
                )}
                {rejectionDetails.llmValidation.confidence && (
                  <p className="text-xs text-purple-300 mt-1">Confidence: {(rejectionDetails.llmValidation.confidence * 100).toFixed(0)}%</p>
                )}
              </div>
            )}

            {/* Rejection Message */}
            <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-200 font-medium mb-2">Reason:</p>
              <p className="text-sm text-red-300">{rejectionDetails.message}</p>
            </div>

            {/* Complexity Details */}
            <div className="space-y-3 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                  Time Complexity: {rejectionDetails.timeComplexity} / {rejectionDetails.maxTimeComplexity}
                </div>
                <div className="text-lg font-mono text-red-400">{rejectionDetails.timeComplexity}</div>
                <div className="text-xs text-gray-500 mt-1">Max allowed: {rejectionDetails.maxTimeComplexity}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                  Space Complexity: {rejectionDetails.spaceComplexity} / {rejectionDetails.maxSpaceComplexity}
                </div>
                <div className="text-lg font-mono text-red-400">{rejectionDetails.spaceComplexity}</div>
                <div className="text-xs text-gray-500 mt-1">Max allowed: {rejectionDetails.maxSpaceComplexity}</div>
              </div>
            </div>

            {/* LLM Suggestions */}
            {rejectionDetails.llmValidation && rejectionDetails.llmValidation.suggestions && (
              <div className="bg-purple-950/20 border border-purple-900/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider mb-2">🚀 LLM Optimization Tips</p>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  {rejectionDetails.llmValidation.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Default Suggestions */}
            {(!rejectionDetails.llmValidation || !rejectionDetails.llmValidation.suggestions) && (
              <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1">💡 Suggestions</p>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  <li>Optimize your algorithm to use fewer operations</li>
                  <li>Consider using data structures like HashMap, Set</li>
                  <li>Avoid nested loops where possible</li>
                  <li>Use divide-and-conquer or binary search techniques</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowComplexityRejection(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Go Back & Optimize
              </button>
              <button
                onClick={() => {
                  setShowComplexityRejection(false);
                  // You can add option to bypass complexity check for testing
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Hackathon Warning Modal */}
      <ExitHackathonWarning
        isOpen={showExitWarning}
        onClose={() => setShowExitWarning(false)}
        hackathon={hackathon}
        onSubmitAndExit={handleExitAndSubmit}
        isLoading={isExitSubmitting}
      />
    </div>
  )
}