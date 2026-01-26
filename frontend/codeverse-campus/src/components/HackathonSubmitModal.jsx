import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle } from 'lucide-react';

/**
 * HackathonSubmitModal.jsx
 * Final submission confirmation modal
 * Simple confirmation dialog - score is calculated server-side and shown on leaderboard
 */
const HackathonSubmitModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false,
  problemsSolved = 0,
  totalProblems = 0
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

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
      fadeIn ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ${
        fadeIn ? 'scale-100' : 'scale-95'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Final Submission</h2>
              <p className="text-indigo-100 text-sm mt-1">Submit your hackathon entry</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-slate-700 font-medium mb-3">You're about to submit:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Problems Solved</span>
                <span className="text-lg font-semibold text-indigo-600">
                  {problemsSolved} / {totalProblems}
                </span>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-800">
              ✓ Your submission will be reviewed and your final score will appear on the leaderboard shortly.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded mt-1 cursor-pointer"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                I confirm that this submission is my own work and I have not violated any contest rules
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-lg border-t border-slate-200 flex gap-3">
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
