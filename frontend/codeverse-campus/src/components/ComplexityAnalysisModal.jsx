import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Loader } from 'lucide-react';


const ComplexityAnalysisModal = ({ 
  isOpen, 
  onClose, 
  analysis = null, 
  isLoading = false,
  onAccept = null 
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' };
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' };
      case 'exceeded':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-600' };
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'accepted':
        return 'Complexity within acceptable limits';
      case 'warning':
        return 'Complexity is acceptable but could be optimized';
      case 'exceeded':
        return 'Complexity exceeds problem constraints';
      default:
        return 'Analyzing complexity...';
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'exceeded':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Loader className="w-6 h-6 text-blue-600 animate-spin" />;
    }
  };

  const statusColors = getStatusColor(analysis?.status);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
      fadeIn ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ${
        fadeIn ? 'scale-100' : 'scale-95'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 rounded-t-lg">
          <h2 className="text-lg font-semibold text-white">Complexity Analysis</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 text-sm">Analyzing your code complexity...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className={`${statusColors.bg} border ${statusColors.border} rounded-lg p-4 flex items-start gap-3`}>
                <div className="flex-shrink-0 mt-0.5">
                  {renderStatusIcon(analysis.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 capitalize">
                    {analysis.status === 'accepted' ? 'Analysis Passed' :
                     analysis.status === 'warning' ? 'Can Be Optimized' :
                     'Exceeds Constraints'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {getStatusMessage(analysis.status)}
                  </p>
                </div>
              </div>

              {/* Complexity Details */}
              <div className="space-y-3">
                {/* Time Complexity */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700">Time Complexity</p>
                    <p className="text-base font-mono font-semibold text-blue-700">
                      {analysis.timeComplexity || 'Unknown'}
                    </p>
                  </div>
                  {analysis.maxTimeComplexity && (
                    <p className="text-xs text-slate-600">
                      Limit: {analysis.maxTimeComplexity}
                    </p>
                  )}
                </div>

                {/* Space Complexity */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700">Space Complexity</p>
                    <p className="text-base font-mono font-semibold text-green-700">
                      {analysis.spaceComplexity || 'Unknown'}
                    </p>
                  </div>
                  {analysis.maxSpaceComplexity && (
                    <p className="text-xs text-slate-600">
                      Limit: {analysis.maxSpaceComplexity}
                    </p>
                  )}
                </div>
              </div>

              {/* Analysis Message */}
              {analysis.message && (
                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysis.message}
                  </p>
                </div>
              )}

              {/* Analysis Time */}
              {analysis.analysisTime && (
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Analysis completed in {analysis.analysisTime}ms
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">No analysis data available</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-lg border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Close
          </button>
          {analysis?.status === 'accepted' && onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Problem
            </button>
          )}
          {analysis?.status !== 'accepted' && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              Got It
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplexityAnalysisModal;
