import React from 'react'


 
export default function QRCodeModal({ open, hackathon, qrCode, registration, onClose }) {
  if (!open || !hackathon) return null

 
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
  const rollNumber = userInfo.rollNumber || registration?.rollNumber || 'student'
  const fullName = userInfo.fullName || userInfo.name || 'Student'

 
  const handleDownloadQR = () => {
    if (!qrCode) {
      alert('QR code not available')
      return
    }

    try {
      const link = document.createElement('a')
      
      
      const sanitizedTitle = hackathon.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      
    
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
            <p><strong>Student Name:</strong> ${fullName}</p>
            <p><strong>Roll Number:</strong> ${rollNumber}</p>
            <p><strong>Event:</strong> ${hackathon.title}</p>
            <p><strong>Date:</strong> ${new Date(hackathon.startDate || hackathon.date).toLocaleString('en-IN')}</p>
            ${hackathon.mode === 'Offline' && hackathon.location ? `
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

      const printWindow = window.open('', '_blank', 'width=800,height=600')
      
      if (!printWindow) {
        alert('Please allow popups to print QR code')
        return
      }

      printWindow.document.write(printContent)
      printWindow.document.close()
      
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-lg font-bold text-gray-900">Your QR Code</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Student & Hackathon Info */}
        <div className="space-y-2 text-sm">
          <p className="text-gray-700"><span className="font-semibold">Student:</span> {fullName}</p>
          <p className="text-gray-700"><span className="font-semibold">Roll Number:</span> {rollNumber}</p>
          <p className="text-gray-700"><span className="font-semibold">Hackathon:</span> {hackathon.title}</p>
          <p className="text-gray-700"><span className="font-semibold">Mode:</span> {hackathon.mode}</p>
          {hackathon.location && (
            <p className="text-gray-700">
              <span className="font-semibold">Venue:</span> {hackathon.location.venueName}, {hackathon.location.city}
            </p>
          )}
        </div>

        {/* QR Code Display */}
        {qrCode ? (
          <div className="border-2 border-indigo-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex justify-center mb-3">
              <div className="bg-white p-3 rounded-lg shadow-md">
                <img 
                  src={qrCode} 
                  alt="Registration QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>
            
            {/* Download & Print Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDownloadQR}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition flex items-center justify-center gap-2"
                title="Download QR Code as PNG"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download QR
              </button>
              <button
                onClick={handlePrintQR}
                className="flex-1 px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-md transition flex items-center justify-center gap-2"
                title="Print QR Code"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print QR
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
            <p className="text-sm text-yellow-800">
              QR code not generated yet. Please try again later.
            </p>
          </div>
        )}

        {/* Warning Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-xs text-amber-900">
            <span className="font-semibold">⚠️ Important:</span> This QR code will be scanned at the hackathon venue for verification. 
            Download or print it for easy access at the event.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-md transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}
