import React, { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export default function ExitHackathonWarning({
  isOpen,
  onClose,
  hackathon,
  onSubmitAndExit,
  isLoading = false
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !hackathon) return null

  const handleExitAndSubmit = async () => {
    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')

      // Call auto-submit endpoint
      const response = await axios.post(
        `${API_URL}/hackathons/${hackathon._id || hackathon.id}/submit`,
        {
          totalViolations: 0,
          violationDetails: [],
          autoSubmittedOnExit: true
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        console.log('✅ Hackathon auto-submitted on exit')
        // Call parent callback to handle navigation
        if (onSubmitAndExit) {
          onSubmitAndExit(response.data)
        }
      }
    } catch (error) {
      console.error('❌ Error auto-submitting hackathon:', error)
      alert('Error submitting hackathon: ' + (error.response?.data?.message || error.message))
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Exit Hackathon?
        </h2>

        {/* Message */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-3">
            <strong>⏱️ This hackathon has a time limit ({hackathon.competitionDuration} minutes)</strong>
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you exit now, your work will be automatically submitted. You <strong>cannot attempt this hackathon again</strong> once submitted.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-2">
          <div className="text-sm text-gray-700">
            <strong>What happens next:</strong>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Your solution will be auto-submitted</li>
            <li>Hackathon marked as "Attempted"</li>
            <li>You'll be redirected to dashboard</li>
            <li>You cannot attempt again</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExitAndSubmit}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 100 2h9.586l1.707 1.707a1 1 0 01-1.414 1.414l-10-10A1 1 0 013 6z" clipRule="evenodd" />
                </svg>
                Exit & Submit
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          This action cannot be undone. Proceed with caution.
        </p>
      </div>
    </div>
  )
}
