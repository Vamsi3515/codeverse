import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

export default function ManageHackathon(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [hackathon, setHackathon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [submissionCount, setSubmissionCount] = useState(0)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetails, setStudentDetails] = useState(null)
  const [showModal, setShowModal] = useState(false)

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
      
      // Fetch leaderboard and submissions
      await fetchLeaderboardAndSubmissions(id)
    } catch (err) {
      console.error('Error fetching hackathon:', err)
      setError(err.message || 'Failed to load hackathon details')
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaderboardAndSubmissions = async (hackathonId) => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch leaderboard
      const leaderboardRes = await fetch(`${API_URL}/hackathons/${hackathonId}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const leaderboardData = await leaderboardRes.json()
      
      if (leaderboardData.success && leaderboardData.leaderboard) {
        setLeaderboard(leaderboardData.leaderboard)
      }

      // Fetch submissions count
      const submissionsRes = await fetch(`${API_URL}/submissions/hackathon/${hackathonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const submissionsData = await submissionsRes.json()
      
      if (submissionsData.success) {
        setSubmissionCount(submissionsData.count || submissionsData.submissions?.length || 0)
      }
    } catch (err) {
      console.error('Error fetching leaderboard/submissions:', err)
    }
  }

  const fetchStudentDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/students/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setStudentDetails(data.user || data.student)
        setShowModal(true)
      }
    } catch (err) {
      console.error('Error fetching student details:', err)
      alert('Failed to fetch student details')
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-gray-600 text-sm">Mode</p>
              <p className="text-gray-900 font-semibold mt-1">{modeDisplay}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-gray-600 text-sm">Type</p>
              <p className="text-gray-900 font-semibold mt-1">{participationType}</p>
            </div>
            <div className="bg-blue-50 rounded p-3 border border-blue-200">
              <p className="text-blue-600 text-sm font-medium">Registrations</p>
              <p className="text-blue-900 font-bold mt-1">{hackathon.registeredCount || 0} / {hackathon.maxParticipants || '∞'}</p>
            </div>
            <div className="bg-green-50 rounded p-3 border border-green-200">
              <p className="text-green-600 text-sm font-medium">Submissions</p>
              <p className="text-green-900 font-bold mt-1">{submissionCount}</p>
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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

        {/* Leaderboard Section */}
        {leaderboard.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🏆</span> Leaderboard ({leaderboard.length} participants)
              </h3>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Rank</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Student Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Score</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Problems Solved</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-xl">🥇</span>}
                          {index === 1 && <span className="text-xl">🥈</span>}
                          {index === 2 && <span className="text-xl">🥉</span>}
                          {index > 2 && <span className="text-gray-600 font-semibold">#{index + 1}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{entry.studentName || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-600">{entry.email || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-lg text-blue-600">{entry.leaderboardScore || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          {entry.problemsSolved || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudent(entry)
                            fetchStudentDetails(entry.userId)
                          }}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-medium transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {showModal && studentDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-sky-600 to-sky-700 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Student Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setStudentDetails(null)
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="text-gray-900 font-medium">{studentDetails.fullName || studentDetails.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-gray-900 font-medium break-all">{studentDetails.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-gray-900 font-medium">{studentDetails.phone || studentDetails.phoneNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Roll Number</p>
                        <p className="text-gray-900 font-medium">{studentDetails.rollNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">College</p>
                        <p className="text-gray-900 font-medium">{studentDetails.college || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-gray-900 font-medium">{studentDetails.department || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Year</p>
                        <p className="text-gray-900 font-medium">{studentDetails.year || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Registration Date</p>
                        <p className="text-gray-900 font-medium">{new Date(studentDetails.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Hackathon Performance */}
                  {selectedStudent && (
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance in This Hackathon</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-blue-600 text-sm font-medium">Score</p>
                          <p className="text-blue-900 text-2xl font-bold mt-1">{selectedStudent.leaderboardScore || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-green-600 text-sm font-medium">Problems Solved</p>
                          <p className="text-green-900 text-2xl font-bold mt-1">{selectedStudent.problemsSolved || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-purple-600 text-sm font-medium">Rank</p>
                          <p className="text-purple-900 text-2xl font-bold mt-1">#{leaderboard.findIndex(e => e._id === selectedStudent._id) + 1}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Section */}
                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="flex flex-wrap gap-3">
                      {studentDetails.email && (
                        <a
                          href={`mailto:${studentDetails.email}`}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2"
                        >
                          📧 Email Student
                        </a>
                      )}
                      {studentDetails.phone || studentDetails.phoneNumber ? (
                        <a
                          href={`tel:${studentDetails.phone || studentDetails.phoneNumber}`}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-2"
                        >
                          📱 Call: {studentDetails.phone || studentDetails.phoneNumber}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
