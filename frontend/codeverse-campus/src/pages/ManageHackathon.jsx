import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

export default function ManageHackathon(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [hackathon, setHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHackathonDetails()
  }, [id])

  const fetchHackathonDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${API_URL}/hackathons/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch hackathon details')
      }

      setHackathon(data.hackathon)
    } catch (err) {
      console.error('Error fetching hackathon:', err)
      setError(err.message || 'Failed to load hackathon details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-sm text-sky-600 mb-4">← Back</button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-900 font-semibold">Error Loading Hackathon</h2>
            <p className="text-red-700 mt-2">{error || 'Hackathon not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const participationType = hackathon.participationType?.toUpperCase() || 'SOLO'
  const modeDisplay = hackathon.mode ? hackathon.mode.charAt(0).toUpperCase() + hackathon.mode.slice(1) : 'N/A'
  const statusDisplay = hackathon.status ? hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1) : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard/organizer')} className="text-sm text-sky-600 mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hackathon.title}</h1>
              <p className="text-gray-600 mt-2">{hackathon.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              statusDisplay === 'Active' ? 'bg-green-100 text-green-700' :
              statusDisplay === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {statusDisplay}
            </span>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-gray-600 text-sm">Mode</p>
              <p className="text-gray-900 font-semibold mt-1">{modeDisplay}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-gray-600 text-sm">Type</p>
              <p className="text-gray-900 font-semibold mt-1">{participationType}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-gray-600 text-sm">Registrations</p>
              <p className="text-gray-900 font-semibold mt-1">{hackathon.registeredCount || 0} / {hackathon.maxParticipants || '∞'}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-gray-600 text-sm">Start Date</p>
              <p className="text-gray-900 font-semibold mt-1">{new Date(hackathon.startDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="text-gray-900 font-medium">{new Date(hackathon.startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="text-gray-900 font-medium">{new Date(hackathon.endDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900 font-medium">
                    {Math.ceil((new Date(hackathon.endDate) - new Date(hackathon.startDate)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>

            {/* Location (if offline or hybrid) */}
            {(hackathon.mode === 'offline' || hackathon.mode === 'hybrid') && hackathon.location && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Venue:</span> <span className="text-gray-900 font-medium">{hackathon.location.venueName}</span></p>
                  <p><span className="text-gray-600">Address:</span> <span className="text-gray-900 font-medium">{hackathon.location.address}</span></p>
                  <p><span className="text-gray-600">City:</span> <span className="text-gray-900 font-medium">{hackathon.location.city}</span></p>
                  {hackathon.location.latitude && hackathon.location.longitude && (
                    <p><span className="text-gray-600">Coordinates:</span> <span className="text-gray-900 font-medium">{hackathon.location.latitude.toFixed(4)}, {hackathon.location.longitude.toFixed(4)}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Team Info */}
            {hackathon.participationType === 'TEAM' || hackathon.participationType === 'team' ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Configuration</h3>
                <div className="space-y-2">
                  <p><span className="text-gray-600">Min Team Size:</span> <span className="text-gray-900 font-medium">{hackathon.minTeamSize || 2}</span></p>
                  <p><span className="text-gray-600">Max Team Size:</span> <span className="text-gray-900 font-medium">{hackathon.maxTeamSize || 5}</span></p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar - Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {!hackathon.isPublished && (
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`http://localhost:5000/api/hackathons/${id}/publish`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await response.json();
                        if (data.success) {
                          alert('✅ Hackathon published successfully!');
                          window.location.reload();
                        } else {
                          alert('❌ Failed to publish: ' + data.message);
                        }
                      } catch (error) {
                        alert('❌ Error: ' + error.message);
                      }
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    📤 Publish Hackathon
                  </button>
                )}
                <button
                  onClick={() => navigate(`/hackathon/${id}/registrations`)}
                  className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition text-sm font-medium"
                >
                  View Registrations
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/hackathon/${id}/edit`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Edit Hackathon
                </button>
                <button
                  onClick={() => navigate(`/hackathon/${id}/registrations`)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                >
                  Manage Team Registrations
                </button>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Registered:</span>
                    <span className="text-gray-900 font-medium">{hackathon.registeredCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="text-gray-900 font-medium">{hackathon.maxParticipants || 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Fee:</span>
                    <span className="text-gray-900 font-medium">₹{hackathon.registrationFee || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hackathon Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Mode</p>
              <p className="text-gray-900 font-semibold">{modeDisplay}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="text-gray-900 font-semibold">{participationType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-gray-900 font-semibold">{statusDisplay}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Published</p>
              <p className="text-gray-900 font-semibold">{hackathon.isPublished ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
