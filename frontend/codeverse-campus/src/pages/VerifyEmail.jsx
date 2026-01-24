import React, { useState } from 'react'

export default function VerifyEmail() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSendOTP = async () => {
    if (!email.trim()) {
      alert('Please enter your email')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      
      if (data.success) {
        setOtpSent(true)
        setMessage('✅ OTP sent! Check your backend console for the OTP code.')
        alert('✅ OTP sent! Check your backend terminal console for the 6-digit OTP code.')
      } else {
        setMessage('❌ ' + (data.message || 'Failed to send OTP'))
        alert(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setMessage('❌ Unable to connect to server')
      alert('Unable to connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      alert('Please enter the OTP')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ Email verified successfully!')
        alert('✅ Email verified successfully! You can now login.')
        setTimeout(() => {
          window.location.href = '/login/student'
        }, 2000)
      } else {
        setMessage('❌ ' + (data.message || 'Invalid OTP'))
        alert(data.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setMessage('❌ Verification failed')
      alert('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-sm text-gray-600">
              Already registered? Complete your email verification here
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                College Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
                className="w-full rounded-lg border border-gray-300 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="your.email@college.edu"
              />
            </div>

            {/* Send OTP Button */}
            {!otpSent && (
              <button
                onClick={handleSendOTP}
                disabled={loading || !email.trim()}
                className="w-full h-12 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            )}

            {/* OTP Input & Verify */}
            {otpSent && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    📧 OTP Sent!
                  </p>
                  <p className="text-xs text-blue-700">
                    Check your <strong>backend terminal console</strong> for the 6-digit OTP code.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full rounded-lg border border-gray-300 h-12 px-4 text-center text-2xl font-mono tracking-widest bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="000000"
                  />
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full h-10 text-blue-600 text-sm font-medium hover:text-blue-700 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            )}

            {/* Back to Registration */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register/student" className="text-blue-600 hover:text-blue-700 font-medium">
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
