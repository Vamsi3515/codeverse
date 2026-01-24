import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'
const BASE_URL = 'http://localhost:5000'

export default function ViewRegistrations() {
  const { hackathonId } = useParams()
  const navigate = useNavigate()
  const [hackathon, setHackathon] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRegistrations()
  }, [hackathonId])

  const fetchRegistrations = async () => {
    try {
      const organizerToken = localStorage.getItem('organizerToken') || localStorage.getItem('token')
      const userRole = localStorage.getItem('userRole')

      if (!organizerToken || userRole !== 'organizer') {
        console.error('❌ Organizer token missing or role mismatch - redirecting to organizer login')
        setError('Authorization Error: Please log in as the organizer who created this hackathon.')
        navigate('/login/organizer')
        return
      }

      console.log('📋 Fetching registrations for hackathon:', hackathonId)
      console.log('📋 Logged user role:', userRole)
      console.log('📋 Authorization token present:', !!organizerToken)

      // Fetch hackathon details
      const hackathonRes = await fetch(`${API_URL}/hackathons/${hackathonId}`)
      const hackathonData = await hackathonRes.json()
      if (hackathonData.success) {
        console.log('✅ Hackathon details fetched:', hackathonData.hackathon.title)
        setHackathon(hackathonData.hackathon)
      }

      // Fetch registrations
      const regRes = await fetch(`${API_URL}/registrations/hackathon/${hackathonId}`, {
        headers: {
          'Authorization': `Bearer ${organizerToken}`,
          'Content-Type': 'application/json'
        }
      })
      const regData = await regRes.json()
      
      console.log('📋 Registration API Response Status:', regRes.status)
      console.log('📋 Registration API Response:', regData)

      if (regData.success) {
        console.log('✅ Registrations fetched successfully:', regData.registrations?.length || 0)
        setRegistrations(regData.registrations || [])
        setError('')
      } else {
        console.error('❌ Registration API Error:', regData.message)
        const errorMessage = regData.message || 'Failed to fetch registrations'
        
        if (regRes.status === 403) {
          setError(`Authorization Error: ${errorMessage}\n\nMake sure you are logged in as the organizer who created this hackathon.`)
        } else if (regRes.status === 404) {
          setError(`Hackathon not found: ${errorMessage}`)
        } else {
          setError(errorMessage)
        }
      }
    } catch (err) {
      console.error('❌ Network/Fetch Error:', err)
      setError('Failed to load registrations. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const participationType = hackathon?.participationType?.toUpperCase() || 'SOLO'
  const isTeamBased = participationType === 'TEAM'

  // Group registrations by team for team-based hackathons
  const teamRegistrations = isTeamBased
    ? registrations.filter(r => r.team && r.team.teamName)
    : []
  
  const soloRegistrations = !isTeamBased ? registrations : []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-semibold mb-2">Registration Access Error</p>
                <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{hackathon?.title || 'Hackathon'}</h1>
              <p className="text-sm text-gray-500 mt-1">Viewing registrations as organizer</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Mode:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                {hackathon?.mode || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {participationType}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Total Registrations:</span>
              <span className="font-bold text-gray-900 px-2 py-1 bg-green-100 text-green-700 rounded">
                {registrations.length}
              </span>
            </div>
            {isTeamBased && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Total Teams:</span>
                <span className="font-bold text-gray-900 px-2 py-1 bg-orange-100 text-orange-700 rounded">
                  {teamRegistrations.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Registrations List */}
        {registrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No registrations yet</p>
          </div>
        ) : isTeamBased ? (
          // Team-based registrations
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Registered Teams</h2>
            {teamRegistrations.map((reg, index) => (
              <div key={reg._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{reg.team.teamName}</h3>
                    <p className="text-sm text-gray-500">
                      Registered on {new Date(reg.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {reg.status}
                  </span>
                </div>

                {/* Team Leader */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Team Leader</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium text-gray-900">{reg.userId?.firstName} {reg.userId?.lastName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium text-gray-900">{reg.team.leader.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Roll Number:</span>
                        <span className="ml-2 font-medium text-gray-900">{reg.team.leader.rollNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Selfie:</span>
                        {reg.userId?.liveSelfie ? (
                          <a
                            href={BASE_URL + reg.userId.liveSelfie}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View
                          </a>
                        ) : (
                          <span className="ml-2 text-gray-500">Not uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                {reg.team.members && reg.team.members.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Team Members ({reg.team.members.length})
                    </h4>
                    <div className="space-y-2">
                      {reg.team.members.map((member, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="ml-2 font-medium text-gray-900">{member.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Roll Number:</span>
                              <span className="ml-2 font-medium text-gray-900">{member.rollNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                member.status === 'CONFIRMED' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {member.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Team Size: <span className="font-semibold text-gray-900">
                      {(reg.team.members?.length || 0) + 1} members
                    </span>
                  </div>
                  {reg.paymentStatus && (
                    <div className="text-gray-600">
                      Payment: <span className={`font-semibold ${
                        reg.paymentStatus === 'completed' || reg.paymentStatus === 'free'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}>
                        {reg.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Solo registrations
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Registered Participants</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Selfie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {soloRegistrations.map((reg, index) => (
                    <tr key={reg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reg.studentName || `${reg.userId?.firstName || ''} ${reg.userId?.lastName || ''}`.trim()}
                        </div>
                        <div className="text-sm text-gray-500">{reg.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reg.rollNumber || reg.userId?.regNumber || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reg.selfieUrl ? (
                          <img
                            src={BASE_URL + reg.selfieUrl}
                            alt="Student selfie"
                            title={`Selfie uploaded on ${new Date(reg.registrationDate).toLocaleDateString()}`}
                            className="h-12 w-12 rounded-full object-cover border border-gray-300 shadow-sm"
                            onError={(e) => {
                              console.error('Failed to load image:', BASE_URL + reg.selfieUrl);
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/%3E%3C/svg%3E';
                              e.target.className = 'h-12 w-12 rounded-full object-cover border border-gray-300 text-gray-400 p-1';
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">Not uploaded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`font-medium ${
                          reg.paymentStatus === 'completed' || reg.paymentStatus === 'free'
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }`}>
                          {reg.paymentStatus?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
