import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';


const ProblemSubmissionConfirm = ({ 
  isOpen, 
  onClose, 
  problemIndex = 0,
  problemTitle = 'Problem',
  language = 'Python',
  timeSpent = 0,
  testsPassed = 0,
  totalTests = 0,
  complexity = {}
}) => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setFadeIn(true), 10);
    } else {
      setFadeIn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
      fadeIn ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ${
        fadeIn ? 'scale-100' : 'scale-95'
      }`}>
        {/* Header with success gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Problem Submitted!</h2>
              <p className="text-green-100 text-sm mt-0.5">Your solution has been recorded</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Problem Info */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Problem</span>
                <span className="text-sm font-medium text-slate-900">
                  {problemTitle} (#{problemIndex + 1})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Language</span>
                <span className="text-sm font-medium text-slate-900">{language}</span>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Test Cases Passed</span>
              <span className="text-lg font-semibold text-blue-600">
                {testsPassed} / {totalTests}
              </span>
            </div>
            {testsPassed === totalTests && (
              <p className="text-xs text-green-600 mt-2 font-medium">All tests passed successfully!</p>
            )}
          </div>

          {/* Complexity Info */}
          {complexity.timeComplexity && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Time Complexity</p>
                <p className="text-sm font-mono font-semibold text-slate-900">
                  {complexity.timeComplexity}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Space Complexity</p>
                <p className="text-sm font-mono font-semibold text-slate-900">
                  {complexity.spaceComplexity}
                </p>
              </div>
            </div>
          )}

          {/* Time Spent */}
          {timeSpent > 0 && (
            <div className="text-center py-2">
              <p className="text-xs text-slate-600">Time spent on this problem</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">{formatTime(timeSpent)}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-lg border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Continue to Next Problem
          </button>
          <p className="text-xs text-slate-600 text-center mt-3">
            You can submit the hackathon when you're done solving all problems
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProblemSubmissionConfirm;
