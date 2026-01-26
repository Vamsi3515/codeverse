import React, { useState, useRef } from 'react'

/**
 * Registration Success Modal with QR Code and Calendar Integration
 * For offline hackathons: shows QR code first, then calendar permission
 * For online hackathons: shows success message and calendar permission
 */
export default function RegistrationSuccessModal({ 
  open, 
  hackathon, 
  registration, 
  onClose,
  onCalendarConnect
}) {
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false)
  const [calendarConnecting, setCalendarConnecting] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const qrImageRef = useRef(null)

  if (!open || !hackathon) return null

  const isOffline = hackathon.mode === 'Offline' || hackathon.mode === 'offline'
  const qrCode = registration?.qrCode || registration?.qrPayload?.qrCode

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
  const rollNumber = userInfo.rollNumber || registration?.student?.rollNumber || 'student'

  /**
   * Download QR Code as PNG
   */
  const handleDownloadQR = () => {
    if (!qrCode) {
      alert('QR code not available')
      return
    }

    try {
      // Create a temporary link element
      const link = document.createElement('a')
      
      // Sanitize hackathon title for filename
      const sanitizedTitle = hackathon.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      
      // Set filename: hackathon_<title>_<rollNumber>.png
      const filename = `hackathon_${sanitizedTitle}_${rollNumber}.png`
      
      link.href = qrCode
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ [QR DOWNLOAD] QR code downloaded:', filename)
    } catch (error) {
      console.error('❌ [QR DOWNLOAD] Failed to download QR:', error)
      alert('Failed to download QR code. Please try again.')
    }
  }

  /**
   * Print QR Code with Student & Hackathon Details
   */
  const handlePrintQR = () => {
    if (!qrCode) {
      alert('QR code not available')
      return
    }

    try {
      // Create print window content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print QR Code - ${hackathon.title}</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
                size: portrait;
              }
              
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                margin: 0;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
            }
            
            .header {
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
              color: #1e40af;
            }
            
            .header h2 {
              margin: 0;
              font-size: 18px;
              color: #333;
            }
            
            .qr-container {
              margin: 30px 0;
              padding: 20px;
              border: 3px solid #1e40af;
              border-radius: 10px;
              background: #f9fafb;
            }
            
            .qr-code {
              max-width: 300px;
              height: auto;
              margin: 0 auto;
              display: block;
            }
            
            .details {
              margin: 20px 0;
              text-align: left;
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
            }
            
            .details p {
              margin: 8px 0;
              font-size: 14px;
              line-height: 1.6;
            }
            
            .details strong {
              color: #1e40af;
              font-weight: 600;
            }
            
            .instruction {
              margin-top: 20px;
              padding: 15px;
              background: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 8px;
              font-size: 13px;
              color: #78350f;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #d1d5db;
              font-size: 11px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hackathon Entry Pass</h1>
            <h2>${hackathon.title}</h2>
          </div>
          
          <div class="qr-container">
            <img src="${qrCode}" alt="QR Code" class="qr-code" />
          </div>
          
          <div class="details">
            <p><strong>Student Name:</strong> ${userInfo.fullName || userInfo.name || 'N/A'}</p>
            <p><strong>Roll Number:</strong> ${rollNumber}</p>
            <p><strong>Event:</strong> ${hackathon.title}</p>
            <p><strong>Date:</strong> ${new Date(hackathon.startDate || hackathon.date).toLocaleString('en-IN')}</p>
            ${isOffline && hackathon.location ? `
              <p><strong>Venue:</strong> ${hackathon.location.venueName || ''}, ${hackathon.location.city || ''}</p>
            ` : ''}
          </div>
          
          <div class="instruction">
            <strong>⚠️ Important:</strong> Scan this QR code at the hackathon venue for verification and entry.
          </div>
          
          <div class="footer">
            <p>Registration ID: ${registration?._id || ''}</p>
            <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </body>
        </html>
      `

      // Create and open print window
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      
      if (!printWindow) {
        alert('Please allow popups to print QR code')
        return
      }

      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // Wait for image to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.onafterprint = () => printWindow.close()
        }, 250)
      }
      
      console.log('✅ [QR PRINT] Print dialog opened')
    } catch (error) {
      console.error('❌ [QR PRINT] Failed to print QR:', error)
      alert('Failed to print QR code. Please try again.')
    }
  }

  const handleConnectCalendar = async () => {
    setCalendarConnecting(true)
    try {
      const success = await onCalendarConnect()
      if (success) {
        setCalendarConnected(true)
        setShowCalendarPrompt(false)
      }
    } catch (error) {
      console.error('Calendar connection failed:', error)
    } finally {
      setCalendarConnecting(false)
    }
  }

  const handleSkipCalendar = () => {
    // Close both the calendar prompt AND the entire modal
    setShowCalendarPrompt(false)
    onClose()
  }

  const handleNextStep = () => {
    if (!showCalendarPrompt && !calendarConnected) {
      setShowCalendarPrompt(true)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {!showCalendarPrompt && !calendarConnected ? (
          // STEP 1: Show QR Code (for offline) or Success Message (for online)
          <>
            {/* Success Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registration Successful ✅</h2>
                <p className="text-sm text-gray-600">You're all set for the hackathon!</p>
              </div>
            </div>

            {/* Hackathon Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-900">{hackathon.title}</p>
              <div className="text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold">Mode:</span> {hackathon.mode}</p>
                <p><span className="font-semibold">Date:</span> {new Date(hackathon.startDate || hackathon.date).toLocaleString('en-IN')}</p>
                {isOffline && hackathon.location && (
                  <p><span className="font-semibold">Venue:</span> {hackathon.location.venueName}, {hackathon.location.city}</p>
                )}
              </div>
            </div>

            {/* QR Code for Offline Hackathons */}
            {isOffline && qrCode && (
              <div className="border-2 border-indigo-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">Your Entry QR Code</h3>
                <div className="flex justify-center mb-3">
                  <div className="bg-white p-3 rounded-lg shadow-md">
                    <img 
                      ref={qrImageRef}
                      src={qrCode} 
                      alt="Registration QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                
                {/* Download & Print Buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleDownloadQR}
                    disabled={!qrCode}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title="Download QR Code as PNG"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR
                  </button>
                  <button
                    onClick={handlePrintQR}
                    disabled={!qrCode}
                    className="flex-1 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    title="Print QR Code"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print QR
                  </button>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-xs text-amber-900">
                    <span className="font-semibold">⚠️ Important:</span> This QR code will be scanned at the hackathon venue for verification. 
                    Download or print it for easy access at the event.
                  </p>
                </div>
              </div>
            )}

            {/* Success Message for Online Hackathons */}
            {!isOffline && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">
                  Check your email for the platform link and event details. You'll receive joining instructions before the hackathon starts.
                </p>
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleNextStep}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition"
            >
              Continue →
            </button>
          </>
        ) : showCalendarPrompt ? (
          // STEP 2: Calendar Permission Prompt
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Add to Google Calendar?</h3>
                <p className="text-sm text-gray-600">
                  Connect your Google Calendar to automatically add this hackathon. 
                  You'll receive reminders before the event.
                </p>
              </div>

              <div className="bg-gray-50 rounded-md p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-gray-700">You will receive reminders:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 24 hours before the event</li>
                  <li>• 1 hour before the event</li>
                  <li>• 10 minutes before the event</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkipCalendar}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                  disabled={calendarConnecting}
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleConnectCalendar}
                  disabled={calendarConnecting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition disabled:opacity-50"
                >
                  {calendarConnecting ? 'Connecting...' : 'Connect Calendar'}
                </button>
              </div>
            </div>
          </>
        ) : (
          // STEP 3: Calendar Connected Success
          <>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Calendar Connected! 📅</h3>
                <p className="text-sm text-gray-600">
                  The hackathon has been added to your Google Calendar. 
                  You'll receive reminders automatically.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
