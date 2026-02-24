import React, { useState, useEffect } from 'react'
import PaymentModal from './PaymentModal'

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

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState({ 
    open: false, 
    registrationFee: 0,
    registrationType: null
  })

  useEffect(() => {
    // Get logged-in student info from localStorage
    const email = localStorage.getItem('userEmail') || ''
    const regNumber = localStorage.getItem('userRegNumber') || ''
    
    // DEBUG: Verify email is being fetched correctly
    console.log('✅ [TEAM REG] Retrieved userEmail from localStorage:', email)
    console.log('✅ [TEAM REG] Retrieved userRegNumber from localStorage:', regNumber)
    console.log('✅ [TEAM REG] Hackathon object received:', hackathon)
    console.log('✅ [TEAM REG] Hackathon registrationFee:', hackathon?.registrationFee)
    
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

  // Get registration fee from hackathon
  const registrationFee = hackathon?.registrationFee || 0

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
    
    // Check if registration has a fee
    const registrationFee = hackathon.registrationFee || 0
    
    console.log('💳 [REGISTRATION] Form submitted');
    console.log('💳 [REGISTRATION] Hackathon:', hackathon);
    console.log('💳 [REGISTRATION] Hackathon.registrationFee:', hackathon?.registrationFee);
    console.log('💳 [REGISTRATION] Registration Fee (calculated):', registrationFee);
    console.log('💳 [REGISTRATION] Is fee > 0?:', registrationFee > 0);
    
    if (registrationFee && registrationFee > 0) {
      // Show payment modal only if there's a fee
      console.log('🔗 [REGISTRATION] Opening payment modal for team registration with fee ₹' + registrationFee);
      setPaymentModal({
        open: true,
        registrationFee,
        registrationType: 'TEAM'
      });
    } else {
      // Direct registration if no fee (fee is 0 or undefined)
      console.log('✅ [REGISTRATION] No fee or fee is 0, registering directly without payment')
      await registerDirectly()
    }
  }

  const registerDirectly = async () => {
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

  const handlePaymentSuccess = (registration) => {
    console.log('🎉 [PAYMENT SUCCESS] Registration complete:', registration)
    console.log('🎉 [PAYMENT SUCCESS] Saving team data to the registration')
    
    // The registration was created by PaymentModal calling the backend
    // The backend already saved the team data during payment verification
    // So just close the modal and trigger success
    onSuccess(registration)
    onClose()
  }

  const handlePaymentFailed = (errorMsg) => {
    console.error('❌ [PAYMENT FAILED]', errorMsg)
    setError(`Payment failed: ${errorMsg}`)
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

            {/* Registration Fee Display */}
            {registrationFee > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-900">Registration Fee Required</h3>
                    <p className="text-xs text-yellow-800 mt-1">After entering team details, you'll be taken to payment.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">₹{registrationFee}</p>
                    <p className="text-xs text-yellow-700 mt-1">Fee amount</p>
                  </div>
                </div>
              </div>
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : registrationFee > 0 ? (
                  <>💳 Register & Pay</>
                ) : (
                  <>✓ Register</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Payment Modal - Only render when open */}
      {paymentModal.open && (
        <PaymentModal
          open={paymentModal.open}
          hackathon={hackathon}
          registrationType={paymentModal.registrationType}
          teamData={{
            teamName,
            leaderRollNumber,
            members: members.map(m => ({
              email: m.email.trim(),
              rollNumber: m.rollNumber.trim()
            }))
          }}
          registrationFee={paymentModal.registrationFee}
          onClose={() => setPaymentModal({ open: false, registrationFee: 0, registrationType: null })}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
        />
      )}
    </div>
  )
}
