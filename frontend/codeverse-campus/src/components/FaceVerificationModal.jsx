import React, { useState, useRef, useEffect } from 'react'


export default function FaceVerificationModal({ 
  open, 
  hackathon, 
  userProfileImage, 
  onClose, 
  onSuccess 
}) {
  const [step, setStep] = useState('camera') 
  const [error, setError] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

 
  const FACE_COMPARISON_API_URL = import.meta.env.VITE_FACE_VERIFY_API_URL || 'http://127.0.0.1:8000/verify'

  useEffect(() => {
    if (open && step === 'camera') {
      startCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [open, step])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', // Use front camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setError('')
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Camera access denied. Please allow camera access to continue.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
        track.enabled = false
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

   
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

  
    stopCamera()

   
    canvas.toBlob((blob) => {
      setCapturedImage(blob)
      setStep('captured')
    }, 'image/jpeg', 0.9)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setStep('camera')
    setError('')
  }

  const verifyFace = async () => {
    console.log('🎯 [VERIFY BUTTON] Clicked')
    console.log('📸 capturedImage:', capturedImage)
    console.log('👤 userProfileImage:', userProfileImage)
    
    if (!capturedImage || !userProfileImage) {
      const errorMsg = !capturedImage ? 'Missing captured image' : 'Missing user profile image'
      console.error('❌ [VERIFY] Error:', errorMsg)
      setError(errorMsg)
      return
    }

    setStep('verifying')
    setError('')

    try {
      // Create FormData to send images
      const formData = new FormData()
      formData.append('live_image', capturedImage, 'captured.jpg')
      
      // If userProfileImage is a URL, fetch it first
      let profileImageBlob
      if (typeof userProfileImage === 'string') {
        console.log('📥 Fetching profile image from URL:', userProfileImage)
        const response = await fetch(userProfileImage)
        if (!response.ok) {
          throw new Error(`Failed to fetch profile image: ${response.statusText}`)
        }
        profileImageBlob = await response.blob()
        console.log('✅ Profile image fetched, size:', profileImageBlob.size)
      } else {
        profileImageBlob = userProfileImage
      }
      
      formData.append('db_image', profileImageBlob, 'profile.jpg')

      // Call face comparison API
      console.log('🔍 Calling face comparison API:', FACE_COMPARISON_API_URL)
      
      const response = await fetch(FACE_COMPARISON_API_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Face comparison API response:', data)
      console.log('📋 [RESPONSE DEBUG] Full response object:', JSON.stringify(data, null, 2))
      console.log('✔️ [RESPONSE DEBUG] data.verified:', data.verified, 'Type:', typeof data.verified)
      console.log('✔️ [RESPONSE DEBUG] data.success:', data.success, 'Type:', typeof data.success)
      console.log('✔️ [RESPONSE DEBUG] data.match:', data.match, 'Type:', typeof data.match)

     
      const isVerified = data.verified === true || (data.success && data.match === true)
      console.log('🎯 [VERIFICATION RESULT] isVerified:', isVerified)
      
     
      let confidence = 0
      if (data.confidence !== undefined) {
        // If confidence is > 1 (e.g. 9.55), assume it's 0-100 scale and normalize
        confidence = data.confidence > 1 ? data.confidence / 100 : data.confidence
      } else if (data.distance !== undefined) {
        // Heuristic: Convert distance to confidence (lower distance = higher confidence)
        // Cosine distance range is usually 0-1 (or 0-2), threshold often around 0.4-0.6
        confidence = Math.max(0, 1 - data.distance)
      }

      if (isVerified) {
        setVerificationResult({
          match: true,
          confidence: confidence,
          message: data.message || 'Face verified successfully!'
        })
        setStep('success')
      } else {
        setVerificationResult({
          match: false,
          confidence: confidence,
          message: data.message || 'Face mismatch detected. Please retake your photo.'
        })
        setStep('failed')
      }
    } catch (error) {
      console.error('❌ Face verification error:', error)
      setError(`Failed to verify face: ${error.message}`)
      setStep('failed')
      setVerificationResult({
        match: false,
        message: 'Network error or API unavailable'
      })
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    setStep('camera')
    setError('')
    setVerificationResult(null)
    onClose()
  }

  const handleProceed = () => {
    stopCamera()
    onSuccess(verificationResult)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Face Verification</h2>
              <p className="text-sm text-gray-600 mt-1">
                Verify your identity to join {hackathon?.title}
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* STEP 1: Camera View */}
          {step === 'camera' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📸 Position your face in the center and click "Capture" when ready
                </p>
              </div>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-white/50 rounded-full"></div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={captureImage}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  📷 Capture Photo
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Captured Image Review */}
          {step === 'captured' && capturedImage && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ Photo captured! Review and verify
                </p>
              </div>

              {!userProfileImage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    ⚠️ Error: Profile image not found. Please ensure your profile photo is uploaded in your account settings.
                  </p>
                </div>
              )}

              <div className="bg-gray-100 rounded-lg p-4">
                <img
                  src={URL.createObjectURL(capturedImage)}
                  alt="Captured"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={verifyFace}
                  disabled={!capturedImage || !userProfileImage}
                  className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
                    !capturedImage || !userProfileImage
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  }`}
                  title={!userProfileImage ? 'Profile image not loaded' : ''}
                >
                  ✓ Verify Face
                </button>
                <button
                  onClick={retakePhoto}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  ↻ Retake
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Verifying */}
          {step === 'verifying' && (
            <div className="space-y-4 text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full animate-pulse">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Verifying your face...</h3>
              <p className="text-gray-600">Please wait while we compare your photos</p>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 'success' && verificationResult && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Verification Successful!</h3>
                <p className="text-gray-600">
                  {verificationResult.message}
                </p>
                {verificationResult.confidence && (
                  <p className="text-sm text-gray-500 mt-2">
                    Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold text-gray-900">📋 Contest Instructions</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Do not switch tabs during the contest - violations will be tracked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Copy-paste may be restricted based on contest rules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Your webcam must remain on if required by organizer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>All activities are logged for anti-cheating purposes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Complete your project submission before the deadline</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleProceed}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-lg transition-all transform hover:scale-[1.02]"
              >
                Continue to Join Hackathon
              </button>
            </div>
          )}

          {/* STEP 5: Failed */}
          {step === 'failed' && verificationResult && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h3>
                <p className="text-gray-600 mb-4">
                  {verificationResult.message}
                </p>
                {verificationResult.confidence !== undefined && (
                  <p className="text-sm text-gray-500">
                    Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Tips for better verification:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Ensure good lighting on your face</li>
                  <li>• Remove glasses or accessories if possible</li>
                  <li>• Face the camera directly</li>
                  <li>• Make sure your profile photo is clear and recent</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
