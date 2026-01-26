import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

/**
 * HackathonSubmitModal.jsx
 * Final submission modal showing score preview and confirmation
 * Professional UI with score breakdown before final submission
 */
const HackathonSubmitModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false,
  scoreBreakdown = null,
  problemsSolved = 0,
  totalProblems = 0,
  timeSpentMinutes = 0,
  violations = 0
}) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}m`;
  };

  const calculateTotalScore = () => {
    if (!scoreBreakdown) return 0;
    return (scoreBreakdown.baseScore || 0) + 
           (scoreBreakdown.timeBonus || 0) - 
           (scoreBreakdown.violationPenalty || 0);
  };

  const totalScore = calculateTotalScore();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
      fadeIn ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-lg shadow-2xl w-full max-w-lg transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
        fadeIn ? 'scale-100' : 'scale-95'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 rounded-t-lg sticky top-0">
          <h2 className="text-xl font-semibold text-white">Final Submission</h2>
          <p className="text-indigo-100 text-sm mt-1">Review your performance before submitting</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Problems Solved Summary */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Problems Solved</span>
              <span className="text-2xl font-bold text-slate-900">
                {problemsSolved} / {totalProblems}
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(problemsSolved / totalProblems) * 100}%` }}
              />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">Score Breakdown</p>
            
            {/* Base Score */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Base Score</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {problemsSolved} problems × 100 points each
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {scoreBreakdown?.baseScore || 0}
                </p>
              </div>
            </div>

            {/* Time Bonus */}
            {scoreBreakdown?.timeBonus !== 0 && (
              <div className={`rounded-lg p-4 border ${
                (scoreBreakdown?.timeBonus || 0) >= 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Time Bonus/Penalty</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Based on speed: {formatTime(timeSpentMinutes)}
                    </p>
                  </div>
                  <p className={`text-xl font-bold ${
                    (scoreBreakdown?.timeBonus || 0) >= 0 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    {(scoreBreakdown?.timeBonus || 0) >= 0 ? '+' : ''}{scoreBreakdown?.timeBonus || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Violation Penalty */}
            {violations > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Violation Penalties</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {violations} violation{violations !== 1 ? 's' : ''} × 10 points
                    </p>
                  </div>
                  <p className="text-xl font-bold text-red-600">
                    -{scoreBreakdown?.violationPenalty || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Total Score */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-5 border-2 border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">Total Score</span>
                <span className="text-3xl font-bold text-indigo-600">
                  {totalScore}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Time Spent</p>
              <p className="text-sm font-semibold text-slate-900">{formatTime(timeSpentMinutes)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-1">Violations</p>
              <p className={`text-sm font-semibold ${violations === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {violations}
              </p>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded mt-1 cursor-pointer"
              />
              <span className="text-xs text-slate-700">
                I confirm that this submission is my own work and I have not violated any contest rules
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-lg border-t border-slate-200 flex gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!agreedToTerms || isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Final Entry'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackathonSubmitModal;
