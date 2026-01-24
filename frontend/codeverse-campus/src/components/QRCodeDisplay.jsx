import React from 'react'

export default function QRCodeDisplay({ hackathon, registration, onClose }) {
  const handleDownload = () => {
    if (!registration.qrCode) return

    // Convert data URL to blob and download
    const link = document.createElement('a')
    link.href = registration.qrCode
    link.download = `${registration.studentName}-${hackathon.title}-QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=500,width=500')
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${registration.studentName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: white;
            }
            .qr-container {
              text-align: center;
            }
            .qr-container h1 {
              margin: 20px 0 10px 0;
              font-size: 24px;
            }
            .qr-container p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .qr-image {
              margin: 20px 0;
              border: 2px solid #333;
              padding: 10px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${registration.studentName}</h1>
            <p>${hackathon.title}</p>
            <p>Registered: ${new Date(registration.registrationDate).toLocaleDateString()}</p>
            <img src="${registration.qrCode}" alt="QR Code" class="qr-image" style="width: 300px; height: 300px;" />
            <p style="margin-top: 30px; font-weight: bold;">Show this QR code at the hackathon venue</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 250)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Registration Confirmed! ✓
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-green-600 text-xl">✓</div>
              <div>
                <h3 className="font-semibold text-green-900">Registration Successful!</h3>
                <p className="text-sm text-green-700 mt-1">
                  You have successfully registered for <strong>{hackathon.title}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Registration Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold text-gray-900">{registration.studentName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Roll Number:</span>
              <span className="font-semibold text-gray-900">{registration.rollNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hackathon:</span>
              <span className="font-semibold text-gray-900">{hackathon.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-gray-900">
                {new Date(registration.registrationDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* QR Code */}
          {registration.qrCode ? (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-3 font-semibold">Your QR Code</p>
              <img
                src={registration.qrCode}
                alt="QR Code"
                className="w-48 h-48 border-2 border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-3 text-center">
                Show this QR code at the hackathon venue for verification
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                QR code is being generated. Please wait or refresh the page.
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Save or download your QR code</li>
              <li>• Show the QR code at the hackathon venue</li>
              <li>• Venue organizer will scan your QR for verification</li>
              <li>• Make sure your live selfie is clear and recognizable</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {registration.qrCode && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition"
                >
                  📥 Download QR
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-sm transition"
                >
                  🖨️ Print
                </button>
              </>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-medium text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
