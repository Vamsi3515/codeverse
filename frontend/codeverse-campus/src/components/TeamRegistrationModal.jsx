import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000/api'

export default function TeamRegistrationModal({ hackathon, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Team data
  const [teamName, setTeamName] = useState('')
  const [teamSize, setTeamSize] = useState(2)
  const [members, setMembers] = useState([])
  
  // Student info
  const [leaderEmail, setLeaderEmail] = useState('')
  const [leaderRollNumber, setLeaderRollNumber] = useState('')

  useEffect(() => {
    // Get logged-in student info from localStorage
    const email = localStorage.getItem('userEmail') || ''
    const regNumber = localStorage.getItem('userRegNumber') || ''
    
    // DEBUG: Verify email is being fetched correctly
    console.log('✅ [TEAM REG] Retrieved userEmail from localStorage:', email)
    console.log('✅ [TEAM REG] Retrieved userRegNumber from localStorage:', regNumber)
    
    setLeaderEmail(email)
    setLeaderRollNumber(regNumber)
    
    // Initialize members based on min team size (empty fields)
    if (hackathon.participationType === 'TEAM' || hackathon.participationType === 'team') {
      const minSize = hackathon.minTeamSize || 2
      const initialMembers = Array(minSize - 1).fill(null).map(() => ({
        email: '',
        rollNumber: ''
      }))
      setMembers(initialMembers)
      setTeamSize(minSize)
      
      console.log('✅ [TEAM REG] Initialized', minSize - 1, 'empty team member fields')
    }
  }, [hackathon])

  const handleTeamSizeChange = (newSize) => {
    const size = parseInt(newSize)
    setTeamSize(size)
    
    // Adjust members array
    const currentLength = members.length
    const needed = size - 1 // -1 for leader
    
    if (needed > currentLength) {
      // Add more members
      const toAdd = needed - currentLength
      setMembers([...members, ...Array(toAdd).fill(null).map(() => ({ email: '', rollNumber: '' }))])
    } else if (needed < currentLength) {
      // Remove extra members
      setMembers(members.slice(0, needed))
    }
  }

  const handleMemberChange = (index, field, value) => {
    const updated = [...members]
    updated[index][field] = value
    setMembers(updated)
  }

  const validateForm = () => {
    if (hackathon.participationType === 'TEAM' || hackathon.participationType === 'team') {
      if (!teamName.trim()) {
        setError('Team name is required')
        return false
      }
      
      // Check leader has roll number
      if (!leaderRollNumber.trim()) {
        setError('Please enter your roll number')
        return false
      }
      
      // Check all members have both email and roll number
      for (let i = 0; i < members.length; i++) {
        if (!members[i].email.trim() || !members[i].rollNumber.trim()) {
          setError(`Please fill in all details for team member ${i + 1}`)
          return false
        }
        
        // Basic email validation
        if (!members[i].email.includes('@')) {
          setError(`Invalid email for team member ${i + 1}`)
          return false
        }
      }
      
      // Check for duplicate emails
      const allEmails = [leaderEmail, ...members.map(m => m.email)].map(e => e.toLowerCase())
      const uniqueEmails = new Set(allEmails)
      if (uniqueEmails.size !== allEmails.length) {
        setError('Duplicate emails found in team')
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to register')
        return
      }

      const registrationData = {
        hackathonId: hackathon._id,
      }

      // Add team data if team-based hackathon
      if (hackathon.participationType === 'TEAM' || hackathon.participationType === 'team') {
        registrationData.teamData = {
          teamName,
          leaderRollNumber,
          members: members.map(m => ({
            email: m.email.trim(),
            rollNumber: m.rollNumber.trim()
          }))
        }
      }

      const response = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.registration)
        onClose()
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const participationType = hackathon.participationType?.toUpperCase() || 'SOLO'
  const isTeamBased = participationType === 'TEAM'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Register for {hackathon.title}
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

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Solo Registration */}
            {!isTeamBased && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This is a solo participation hackathon. Click register to confirm your participation.
                </p>
              </div>
            )}

            {/* Team Registration */}
            {isTeamBased && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Team Requirements</h3>
                  <p className="text-sm text-blue-800">
                    Team size must be between {hackathon.minTeamSize || 2} and {hackathon.maxTeamSize || 4} members
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={teamSize}
                    onChange={e => handleTeamSizeChange(e.target.value)}
                    required
                  >
                    {Array.from(
                      { length: (hackathon.maxTeamSize || 4) - (hackathon.minTeamSize || 2) + 1 },
                      (_, i) => (hackathon.minTeamSize || 2) + i
                    ).map(size => (
                      <option key={size} value={size}>{size} members</option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Leader (You)</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-700"
                        value={leaderEmail}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Roll Number</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={leaderRollNumber}
                        onChange={e => setLeaderRollNumber(e.target.value)}
                        placeholder="Enter your roll number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members</h3>
                  <div className="space-y-4">
                    {members.map((member, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Member {index + 1}</h4>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            College Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={member.email}
                            onChange={e => handleMemberChange(index, 'email', e.target.value)}
                            placeholder="member@college.edu"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Roll Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={member.rollNumber}
                            onChange={e => handleMemberChange(index, 'rollNumber', e.target.value)}
                            placeholder="Enter roll number"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
