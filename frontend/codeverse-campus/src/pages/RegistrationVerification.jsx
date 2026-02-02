import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

/**
 * QR Code Verification Page
 * Displays full registration details when QR code is scanned
 * Shows: Student info, photo, hackathon details, registration status
 */
export default function RegistrationVerification() {
  const { registrationId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    fetchRegistrationDetails()
  }, [registrationId])

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      const response = await axios.get(
        `${backendUrl}/api/registrations/verify/${registrationId}`
      )

      if (response.data.success) {
        setRegistration(response.data.data)
        console.log('✅ [VERIFICATION] Registration details loaded:', response.data.data)
      } else {
        setError('Registration not found')
      }
    } catch (err) {
      console.error('❌ [VERIFICATION] Failed to load registration:', err)
      setError(err.response?.data?.message || 'Failed to verify registration')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying registration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (!registration) {
    return null
  }

  const { student, hackathon, status, registeredAt, registrationDate, teamName, team, participationType } = registration
  const isActive = status === 'registered' || status === 'confirmed'
  const isTeamRegistration = participationType && participationType.toUpperCase() === 'TEAM'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-xl p-6 border-b-4 border-indigo-600">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isActive ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isActive ? (
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isActive ? 'Registration Verified ✓' : 'Registration Invalid'}
            </h1>
            <p className="text-sm text-gray-600">
              {isActive ? 'This participant is registered for the hackathon' : 'This registration is not active'}
            </p>
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-white shadow-xl p-6 space-y-6">
          <div className="flex items-start gap-6">
            {/* Student Photo */}
            <div className="flex-shrink-0">
              {student.selfie ? (
                <img
                  src={student.selfie}
                  alt={student.fullName}
                  className="w-32 h-32 rounded-lg object-cover border-4 border-indigo-200 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center border-4 border-indigo-200 shadow-md">
                  <span className="text-4xl font-bold text-indigo-700">
                    {student.fullName?.charAt(0).toUpperCase() || 'S'}
                  </span>
                </div>
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{student.fullName}</h2>
                <p className="text-lg text-indigo-600 font-semibold">{student.rollNumber}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Email</p>
                  <p className="text-gray-900">{student.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Phone</p>
                  <p className="text-gray-900">{student.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">College</p>
                  <p className="text-gray-900">{student.college || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Branch</p>
                  <p className="text-gray-900">{student.branch || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Info (if applicable) */}
          {isTeamRegistration && team && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div className="border-b border-blue-200 pb-3">
                <p className="text-sm font-semibold text-blue-900">
                  <span className="text-blue-600">👥 Team Name:</span> {team.teamName}
                </p>
              </div>

              {/* Team Leader */}
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="text-lg">👤</span> Team Leader
                </h4>
                <div className="bg-white rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Email:</span>
                    <span className="text-xs font-medium text-gray-900">{team.leader.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Roll Number:</span>
                    <span className="text-xs font-medium text-gray-900">{team.leader.rollNumber}</span>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {team.members && team.members.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">👥</span> Team Members ({team.members.length})
                  </h4>
                  <div className="space-y-2">
                    {team.members.map((member, index) => (
                      <div key={index} className="bg-white rounded p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">Email:</span>
                              <span className="text-xs font-medium text-gray-900">{member.email}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-600">Roll Number:</span>
                              <span className="text-xs font-medium text-gray-900">{member.rollNumber}</span>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            member.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hackathon Details */}
        <div className="bg-white shadow-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Hackathon Details
          </h3>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
              <h4 className="text-lg font-bold text-indigo-900 mb-2">{hackathon.title}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>Date:</strong> {new Date(hackathon.startDate || hackathon.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>Time:</strong> {new Date(hackathon.startDate || hackathon.date).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-gray-700">
                    <strong>Mode:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      hackathon.mode === 'Offline' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {hackathon.mode}
                    </span>
                  </span>
                </div>

                {hackathon.mode === 'Offline' && hackathon.location && (
                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-indigo-200">
                    <svg className="w-4 h-4 text-indigo-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-700"><strong>Venue:</strong></p>
                      <p className="text-gray-600">
                        {hackathon.location.venueName}<br />
                        {hackathon.location.address}<br />
                        {hackathon.location.city}, {hackathon.location.state} {hackathon.location.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Status */}
            <div className={`rounded-lg p-4 grid grid-cols-2 gap-4 ${
              isActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div>
                <p className="text-sm font-semibold text-gray-700">Registration Status</p>
                <p className={`text-lg font-bold ${
                  isActive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {status.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Registered On</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(registrationDate || registeredAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(registrationDate || registeredAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Organizer Info */}
            {hackathon.organizer && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Organized By</p>
                <p className="text-gray-900">{hackathon.organizer.fullName || hackathon.organizer.name}</p>
                {hackathon.organizer.email && (
                  <p className="text-sm text-gray-600">{hackathon.organizer.email}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-b-2xl shadow-xl p-6 text-center space-y-4">
          <div className="text-xs text-gray-500">
            <p>Registration ID: {registrationId}</p>
            <p>Verified on: {new Date().toLocaleString('en-IN')}</p>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}
