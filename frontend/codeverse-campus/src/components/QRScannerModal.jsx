import React, { useState, useRef, useEffect } from 'react'

export default function QRScannerModal({ hackathonId, hackathonTitle, onClose, onVerify }) {
  const [scanning, setScanning] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Simple QR code detection (basic decoding)
  const decodeQR = (imageData) => {
    // This is a placeholder - in production, use a library like jsQR or zxing
    // For MVP, we'll manually parse URL parameters or JSON data
    return null
  }

  useEffect(() => {
    if (!scanning) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        setError('Camera access denied or unavailable')
        setScanning(false)
      }
    }

    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [scanning])

  const handleManualEntry = async () => {
    const qrToken = prompt('Enter QR Token manually:')
    if (!qrToken) return

    await verifyQR(qrToken)
  }

  const verifyQR = async (qrToken) => {
    try {
      setError('')
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:5000/api/registrations/verify-qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrToken }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          verified: true,
          ...data.data,
        })
        setScanning(false)
        if (onVerify) {
          onVerify(data.data)
        }
      } else {
        setError(data.message || 'Invalid QR code')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('Failed to verify QR code')
    }
  }

  if (result && result.verified) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-2xl font-bold text-green-600">Verified!</h2>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500">Student Name</p>
              <p className="text-lg font-semibold text-gray-900">{result.studentName}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Roll Number</p>
                <p className="text-sm font-medium text-gray-800">{result.rollNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">College</p>
                <p className="text-sm font-medium text-gray-800">{result.college}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">Hackathon</p>
              <p className="text-sm font-medium text-gray-800">{result.registeredHackathon}</p>
            </div>

            {result.selfieImageUrl && (
              <div className="flex justify-center">
                <img
                  src={result.selfieImageUrl}
                  alt="Student Selfie"
                  className="w-24 h-24 rounded-lg object-cover border border-gray-300"
                />
              </div>
            )}

            <div className="text-center py-2">
              <p className="text-xs text-green-700 font-medium">✓ Student allowed entry</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setResult(null)
                setScanning(true)
                setError('')
              }}
              className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
            >
              Scan Next QR
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600">{hackathonTitle}</p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {scanning && (
          <div className="space-y-3">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* QR Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4/5 h-4/5 border-2 border-yellow-400 rounded-lg shadow-lg"></div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Position the QR code inside the frame
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleManualEntry}
                className="flex-1 py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                📝 Enter Manually
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
