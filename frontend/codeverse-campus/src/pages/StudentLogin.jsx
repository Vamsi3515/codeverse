import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function StudentLogin(){
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const fetchStudentProfile = async (token, userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.student?.liveSelfie) {
          localStorage.setItem('userSelfie', data.student.liveSelfie)
          console.log('✅ [PROFILE] Student selfie stored:', data.student.liveSelfie)
        }
      }
    } catch (error) {
      console.error('❌ [PROFILE] Failed to fetch student profile:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please enter email and password')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      })
      
      if (!response.ok) {
        const data = await response.json()
        setError(data.message || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      const data = await response.json()
      
      if (data.success) {
        console.log('🔍 [LOGIN DEBUG] User data received:', data.user);
        console.log('📍 [LOGIN DEBUG] College:', data.user.college);
        
        const fullName = data.user.firstName + ' ' + data.user.lastName
        login(data.token, 'student', fullName, data.user.id)
        
        localStorage.setItem('userEmail', data.user.email)
        localStorage.setItem('userRegNumber', data.user.regNumber || '')
        localStorage.setItem('userCollege', data.user.college || '')
        localStorage.setItem('userCollegeAddress', data.user.collegeAddress || data.user.college || '')
        
        fetchStudentProfile(data.token, data.user.id)
        navigate('/dashboard/student')
      } else {
        setError(data.message || 'Login failed. Please check your credentials.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to server. Please check if the server is running.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Student Login
          </h1>
          <p className="text-gray-600">Sign in to your account and explore amazing hackathons</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 cursor-pointer" />
                <span className="text-gray-600 cursor-pointer">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-75 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue as</span>
            </div>
          </div>

          {/* Alternative Login */}
          <Link to="/login/organizer" className="w-full py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition text-center">
            Sign In as Organizer
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup/student" className="text-blue-600 font-semibold hover:text-blue-700 transition">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  )
}
