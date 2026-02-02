import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import OfflineLocationPicker from '../components/OfflineLocationPicker'

const API_URL = 'http://localhost:5000/api'

export default function EditHackathon() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Basic details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hackathonImage, setHackathonImage] = useState(null)
  const [hackathonImageUrl, setHackathonImageUrl] = useState('')
  const [hackathonImagePreview, setHackathonImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [mode, setMode] = useState('online')
  const [offlineLocation, setOfflineLocation] = useState(null)
  const [participationType, setParticipationType] = useState('team')
  const [minTeamSize, setMinTeamSize] = useState(2)
  const [maxTeamSize, setMaxTeamSize] = useState(4)
  const [maxParticipants, setMaxParticipants] = useState(100)
  const [registrationFee, setRegistrationFee] = useState('0')
  const [rules, setRules] = useState('')

  // Problem statements
  const [problemStatements, setProblemStatements] = useState([])
  const [showProblemForm, setShowProblemForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [currentProblem, setCurrentProblem] = useState({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    explanation: '',
    sampleTestCases: [],
    hiddenTestCases: [],
    timeLimit: 1,
    memoryLimit: 256,
    allowedLanguages: ['C', 'C++', 'Java', 'Python'],
    resources: ''
  })

  // Test case management
  const [currentTestCase, setCurrentTestCase] = useState({ input: '', output: '', isHidden: false })

  // Anti-cheat config
  const [tabSwitchAllowed, setTabSwitchAllowed] = useState(true)
  const [copyPasteAllowed, setCopyPasteAllowed] = useState(true)
  const [fullScreenRequired, setFullScreenRequired] = useState(false)

  // Schedule
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [competitionDurationHours, setCompetitionDurationHours] = useState('')
  const [competitionDurationMinutes, setCompetitionDurationMinutes] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Add test case function
  const addTestCase = () => {
    setError('')
    
    if (!currentTestCase.input || !currentTestCase.output) {
      setError('Please enter both input and output for the test case')
      return
    }

    const newTestCase = {
      input: currentTestCase.input,
      output: currentTestCase.output
    }

    if (currentTestCase.isHidden) {
      setCurrentProblem({
        ...currentProblem,
        hiddenTestCases: [...currentProblem.hiddenTestCases, newTestCase]
      })
      setMessage(`✅ Hidden test case #${currentProblem.hiddenTestCases.length + 1} added!`)
    } else {
      setCurrentProblem({
        ...currentProblem,
        sampleTestCases: [...currentProblem.sampleTestCases, newTestCase]
      })
      setMessage(`✅ Sample test case #${currentProblem.sampleTestCases.length + 1} added!`)
    }

    setCurrentTestCase({ input: '', output: '', isHidden: false })
    setTimeout(() => setMessage(''), 2000)
  }

  // Remove test case function
  const removeTestCase = (index, isHidden) => {
    if (isHidden) {
      setCurrentProblem({
        ...currentProblem,
        hiddenTestCases: currentProblem.hiddenTestCases.filter((_, i) => i !== index)
      })
    } else {
      setCurrentProblem({
        ...currentProblem,
        sampleTestCases: currentProblem.sampleTestCases.filter((_, i) => i !== index)
      })
    }
  }

  // Fetch existing hackathon details
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_URL}/hackathons/${id}`)
        const data = await response.json()

        if (!response.ok || !data?.hackathon) {
          throw new Error(data.message || 'Failed to load hackathon details')
        }

        const h = data.hackathon
        setTitle(h.title || '')
        setDescription(h.description || '')
        setMode(h.mode || 'online')
        setParticipationType((h.participationType || 'team').toLowerCase())
        setRegistrationFee((h.registrationFee ?? 0).toString())
        setMinTeamSize(h.minTeamSize || 2)
        setMaxTeamSize(h.maxTeamSize || 4)
        setMaxParticipants(h.maxParticipants || 100)
        setRules((h.rules || []).join('\n'))
        setOfflineLocation(h.location || null)
        // Convert relative paths to full URLs
        const bannerImg = h.bannerImage || '';
        const fullImageUrl = bannerImg.startsWith('/uploads/') ? `http://localhost:5000${bannerImg}` : bannerImg;
        console.log('🖼️ EDIT PAGE: Loading hackathon image:', bannerImg, '→', fullImageUrl);
        setHackathonImageUrl(fullImageUrl)
        setHackathonImagePreview(fullImageUrl)
        setProblemStatements(h.problemStatements || [])
        setTabSwitchAllowed(h.antiCheatRules?.tabSwitchAllowed ?? true)
        setCopyPasteAllowed(h.antiCheatRules?.copyPasteAllowed ?? true)
        setFullScreenRequired(h.antiCheatRules?.fullScreenRequired ?? false)

        // Load competition duration if exists (even if it's 0, we should preserve it)
        if (h.competitionDuration !== undefined && h.competitionDuration !== null) {
          const totalMinutes = h.competitionDuration
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          console.log('⏱️ Loading competition duration:', totalMinutes, 'minutes →', hours, 'hours,', minutes, 'minutes')
          setCompetitionDurationHours(hours.toString())
          setCompetitionDurationMinutes(minutes.toString())
        } else {
          console.log('⏱️ No competition duration set')
          setCompetitionDurationHours('')
          setCompetitionDurationMinutes('')
        }

        // Convert to datetime-local format
        if (h.startDate) {
          const formattedStart = new Date(h.startDate).toISOString().slice(0, 16)
          console.log('📅 Loading startDate:', h.startDate, '→', formattedStart)
          setStartDateTime(formattedStart)
        }
        if (h.endDate) {
          const formattedEnd = new Date(h.endDate).toISOString().slice(0, 16)
          console.log('📅 Loading endDate:', h.endDate, '→', formattedEnd)
          setEndDateTime(formattedEnd)
        }
      } catch (err) {
        console.error('Error fetching hackathon:', err)
        setError(err.message || 'Failed to load hackathon')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathon()
  }, [id])

  const calculateDuration = (start, end) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const hours = Math.abs(endDate - startDate) / 36e5
    return Math.round(hours)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to edit a hackathon')
        navigate('/login/organizer')
        return
      }

      if (!title || !description || !startDateTime || !endDateTime) {
        setError('Please fill all required fields')
        setSaving(false)
        return
      }

      if (mode === 'offline' && !offlineLocation) {
        setError('Location is required for offline hackathons')
        setSaving(false)
        return
      }

      // Problem statements are required only for ONLINE hackathons
      if (mode === 'online' && problemStatements.length === 0) {
        setError('Please add at least one problem statement for online hackathons')
        setSaving(false)
        return
      }

      const competitionMinutes = (parseInt(competitionDurationHours || 0) * 60) + parseInt(competitionDurationMinutes || 0)
      
      const hackathonData = {
        title,
        description,
        mode,
        startDate: startDateTime,
        endDate: endDateTime,
        duration: calculateDuration(startDateTime, endDateTime),
        ...(competitionMinutes > 0 ? { competitionDuration: competitionMinutes } : {}),
        location: mode === 'offline' ? offlineLocation : null,
        bannerImage: hackathonImageUrl || '',
        registrationFee: parseInt(registrationFee) || 0,
        maxParticipants: parseInt(maxParticipants) || 100,
        participationType: participationType.toUpperCase(),
        minTeamSize: participationType === 'team' ? parseInt(minTeamSize) : 1,
        maxTeamSize: participationType === 'team' ? parseInt(maxTeamSize) : 1,
        rules: rules ? rules.split('\n').filter(Boolean) : [],
        problemStatements: problemStatements,
        antiCheatRules: mode === 'online' ? {
          tabSwitchAllowed,
          copyPasteAllowed,
          fullScreenRequired
        } : {
          tabSwitchAllowed: true,
          copyPasteAllowed: true,
          fullScreenRequired: false
        }
      }

      console.log('💾 SAVING HACKATHON DATA:', hackathonData)
      console.log('⏱️ Competition Duration to save:', hackathonData.competitionDuration || 'Not set', 'minutes')
      console.log('📅 Dates to save:', { startDate: hackathonData.startDate, endDate: hackathonData.endDate })

      const response = await fetch(`${API_URL}/hackathons/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hackathonData)
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        throw new Error(data.message || 'Failed to update hackathon')
      }

      console.log('✅ BACKEND RESPONSE:', data)
      console.log('✅ Updated hackathon competitionDuration:', data.hackathon?.competitionDuration, 'minutes')
      console.log('✅ Updated hackathon startDate:', data.hackathon?.startDate)
      console.log('✅ Updated hackathon endDate:', data.hackathon?.endDate)

      setMessage('Hackathon updated successfully!')
      setTimeout(() => navigate(`/hackathon/${id}/manage`), 1000)
    } catch (err) {
      console.error('Error updating hackathon:', err)
      setError(err.message || 'Failed to update hackathon')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate('/dashboard/organizer')} className="text-sm text-sky-600 mb-4">← Back to Dashboard</button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-900 font-semibold">Error Loading Hackathon</h2>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Hackathon</h1>
          <p className="text-gray-600 mt-2">Update your hackathon details</p>
        </header>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* Basic Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Mode & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Participation Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={participationType}
                onChange={(e) => setParticipationType(e.target.value)}
              >
                <option value="solo">Solo</option>
                <option value="team">Team</option>
              </select>
            </div>
          </div>

          {/* Team sizes if team */}
          {participationType === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Team Size</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Team Size</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={startDateTime}
                onChange={(e) => {
                  setStartDateTime(e.target.value)
                  // If end date is set and is before start + 24 hours, clear it
                  if (endDateTime) {
                    const startDate = new Date(e.target.value);
                    const endDate = new Date(endDateTime);
                    const minEndDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                    if (endDate < minEndDate) {
                      setEndDateTime('');
                    }
                  }
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={endDateTime}
                disabled={!startDateTime}
                min={startDateTime ? new Date(new Date(startDateTime).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                onChange={(e) => {
                  const endDate = new Date(e.target.value);
                  const startDate = new Date(startDateTime);
                  const minEndDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                  
                  // Only set if end date is at least 24 hours after start date
                  if (endDate >= minEndDate) {
                    setEndDateTime(e.target.value)
                  }
                }}
                required
              />
              {startDateTime && !endDateTime && <p className="text-xs text-gray-500 mt-1">Must be at least 24 hours after start date</p>}
              {!startDateTime && <p className="text-xs text-gray-400 mt-1">Select start date first</p>}
            </div>
          </div>

          {/* Competition Duration (Optional) */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">⏱️ Completion Time (Optional)</h3>
            <p className="text-xs text-gray-600 mb-4">
              <strong>Duration:</strong> How long the hackathon is open. <strong>Completion Time:</strong> How long users have to submit after joining.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Time - Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    value={competitionDurationHours}
                    onChange={e => setCompetitionDurationHours(e.target.value)}
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-700 font-medium py-2">hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Time - Minutes
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    value={competitionDurationMinutes}
                    onChange={e => setCompetitionDurationMinutes(e.target.value)}
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-700 font-medium py-2">min</span>
                </div>
              </div>
            </div>

            {(competitionDurationHours || competitionDurationMinutes) && (
              <div className="mt-3 p-3 bg-white border border-blue-200 rounded text-sm">
                <strong>⏰ Total time after joining:</strong> {parseInt(competitionDurationHours || 0)} hours and {parseInt(competitionDurationMinutes || 0)} minutes ({parseInt(competitionDurationHours || 0) * 60 + parseInt(competitionDurationMinutes || 0)} minutes)
              </div>
            )}
          </div>

          {/* Offline Location */}
          {mode === 'offline' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Offline Location</h2>
              <OfflineLocationPicker value={offlineLocation} onChange={setOfflineLocation} />
            </div>
          )}

          {/* Registration & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
              <input
                type="number"
                min={1}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee (₹)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rules (one per line)</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                rows={4}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
              />
            </div>
          </div>

          {/* Hackathon Image */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hackathon Image</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image (Optional)</label>
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.webp"
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0]
                  if (!file) return
                  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
                  if (!allowedTypes.includes(file.type)) {
                    alert('Only .jpg, .jpeg, .png, and .webp files are allowed')
                    return
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB')
                    return
                  }
                  setHackathonImage(file)
                  const reader = new FileReader()
                  reader.onloadend = () => {
                    setHackathonImagePreview(reader.result)
                  }
                  reader.readAsDataURL(file)
                  // Upload image
                  setUploadingImage(true)
                  try {
                    const formData = new FormData()
                    formData.append('hackathonImage', file)
                    const response = await fetch('http://localhost:5000/api/auth/upload-hackathon-image', {
                      method: 'POST',
                      body: formData,
                    })
                    const data = await response.json()
                    console.log('🖼️ FRONTEND: Image upload response received');
                    console.log('   Response:', data);
                    console.log('   imageUrl from response:', data.imageUrl);
                    if (data.success) {
                      console.log('   ✅ Setting hackathonImageUrl to:', data.imageUrl);
                      setHackathonImageUrl(data.imageUrl)
                    } else {
                      alert(data.message || 'Failed to upload hackathon image')
                      setHackathonImage(null)
                      setHackathonImagePreview('')
                    }
                  } catch (error) {
                    alert('Failed to upload hackathon image')
                    setHackathonImage(null)
                    setHackathonImagePreview('')
                  } finally {
                    setUploadingImage(false)
                  }
                }}
                disabled={uploadingImage}
                className="w-full rounded-lg border border-gray-300 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingImage && <p className="text-xs text-blue-600 mt-2">Uploading image...</p>}
              {hackathonImagePreview && (
                <div className="mt-3 w-full border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <img 
                    src={hackathonImagePreview} 
                    alt="Hackathon Banner Preview" 
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
              {hackathonImageUrl && <p className="text-xs text-green-600 mt-2">✅ Image uploaded successfully</p>}
            </div>
          </div>

          {/* Anti-Cheat Configuration */}
          {mode === 'online' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Anti-Cheating Configuration</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={tabSwitchAllowed}
                    onChange={(e) => setTabSwitchAllowed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Allow Tab Switching</p>
                    <p className="text-xs text-gray-600">Organizers can switch tabs when checked</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={copyPasteAllowed}
                    onChange={(e) => setCopyPasteAllowed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Allow Copy Paste</p>
                    <p className="text-xs text-gray-600">Organizers can copy and paste code</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={fullScreenRequired}
                    onChange={(e) => setFullScreenRequired(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Require Full Screen</p>
                    <p className="text-xs text-gray-600">Hackathon must be in full screen mode</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Problem Statements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Coding Problem Statements</h2>
              {mode === 'offline' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Optional for offline hackathons
                </span>
              )}
              {mode === 'online' && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  Required for online hackathons
                </span>
              )}
            </div>
            
            {/* Add Problem Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setShowProblemForm(!showProblemForm)
                  setEditingIndex(null)
                  if (!showProblemForm) {
                    setCurrentProblem({
                      title: '',
                      description: '',
                      inputFormat: '',
                      outputFormat: '',
                      constraints: '',
                      sampleInput: '',
                      sampleOutput: '',
                      explanation: '',
                      sampleTestCases: [],
                      hiddenTestCases: [],
                      timeLimit: 1,
                      memoryLimit: 256,
                      allowedLanguages: ['C', 'C++', 'Java', 'Python'],
                      resources: ''
                    })
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {showProblemForm ? 'Cancel' : '+ Add Problem'}
              </button>
            </div>

            {/* Problem Form */}
            {showProblemForm && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingIndex !== null ? 'Edit Problem' : 'Add Problem'}</h3>
                
                {/* Problem Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Problem Title *</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    value={currentProblem.title}
                    onChange={(e) => setCurrentProblem({...currentProblem, title: e.target.value})}
                    placeholder="e.g., Two Sum Problem"
                    required
                  />
                </div>

                {/* Problem Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                    rows="4"
                    value={currentProblem.description}
                    onChange={(e) => setCurrentProblem({...currentProblem, description: e.target.value})}
                    placeholder="Describe the problem..."
                    required
                  />
                </div>

                {/* Input Format */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Input Format</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                    rows="2"
                    value={currentProblem.inputFormat}
                    onChange={(e) => setCurrentProblem({...currentProblem, inputFormat: e.target.value})}
                  />
                </div>

                {/* Output Format */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                    rows="2"
                    value={currentProblem.outputFormat}
                    onChange={(e) => setCurrentProblem({...currentProblem, outputFormat: e.target.value})}
                  />
                </div>

                {/* Constraints */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Constraints</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                    rows="2"
                    value={currentProblem.constraints}
                    onChange={(e) => setCurrentProblem({...currentProblem, constraints: e.target.value})}
                  />
                </div>

                {/* Sample Input/Output */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sample Input</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                      rows="3"
                      value={currentProblem.sampleInput}
                      onChange={(e) => setCurrentProblem({...currentProblem, sampleInput: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sample Output</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                      rows="3"
                      value={currentProblem.sampleOutput}
                      onChange={(e) => setCurrentProblem({...currentProblem, sampleOutput: e.target.value})}
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 resize-none"
                    rows="2"
                    value={currentProblem.explanation}
                    onChange={(e) => setCurrentProblem({...currentProblem, explanation: e.target.value})}
                  />
                </div>

                {/* Test Cases Configuration */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">Test Cases</h4>
                      <p className="text-sm text-gray-500">Add test cases as needed.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white">Sample: {currentProblem.sampleTestCases.length}</span>
                      <span className="px-2 py-1 rounded border border-gray-200 bg-white">Hidden: {currentProblem.hiddenTestCases.length}</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm mb-4">
                    {message && <div className="mb-3 p-2 bg-green-100 text-green-800 text-sm rounded">{message}</div>}
                    {error && <div className="mb-3 p-2 bg-red-100 text-red-800 text-sm rounded">{error}</div>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Test Input <span className="text-red-500">*</span></label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          value={currentTestCase.input}
                          onChange={e => setCurrentTestCase({...currentTestCase, input: e.target.value})}
                          onKeyDown={e => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                              addTestCase()
                            }
                          }}
                          placeholder="Enter test input"
                          rows="2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Expected Output <span className="text-red-500">*</span></label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          value={currentTestCase.output}
                          onChange={e => setCurrentTestCase({...currentTestCase, output: e.target.value})}
                          onKeyDown={e => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                              addTestCase()
                            }
                          }}
                          placeholder="Enter expected output"
                          rows="2"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                        <input
                          type="checkbox"
                          checked={currentTestCase.isHidden}
                          onChange={e => setCurrentTestCase({...currentTestCase, isHidden: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <span>Mark as hidden test case</span>
                      </label>
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Add test case
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-semibold text-gray-900">Sample Test Cases</h5>
                        <span className="text-xs text-gray-500">{currentProblem.sampleTestCases.length}</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentProblem.sampleTestCases.map((tc, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-md p-2 text-xs bg-gray-50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-900">Test {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeTestCase(idx, false)}
                                className="text-gray-500 hover:text-red-600 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="font-mono text-gray-700 space-y-1">
                              <div>In: {tc.input.substring(0, 60)}{tc.input.length > 60 ? '...' : ''}</div>
                              <div>Out: {tc.output.substring(0, 60)}{tc.output.length > 60 ? '...' : ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-semibold text-gray-900">Hidden Test Cases</h5>
                        <span className="text-xs text-gray-500">{currentProblem.hiddenTestCases.length}</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentProblem.hiddenTestCases.map((tc, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-md p-2 text-xs bg-gray-50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-900">Test {idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeTestCase(idx, true)}
                                className="text-gray-500 hover:text-red-600 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="font-mono text-gray-700 space-y-1">
                              <div>In: {tc.input.substring(0, 60)}{tc.input.length > 60 ? '...' : ''}</div>
                              <div>Out: {tc.output.substring(0, 60)}{tc.output.length > 60 ? '...' : ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time and Memory Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={currentProblem.timeLimit}
                      onChange={(e) => setCurrentProblem({...currentProblem, timeLimit: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Memory Limit (MB)</label>
                    <input
                      type="number"
                      min="64"
                      step="64"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      value={currentProblem.memoryLimit}
                      onChange={(e) => setCurrentProblem({...currentProblem, memoryLimit: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Add Problem Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentProblem.title && currentProblem.description) {
                        if (editingIndex !== null) {
                          // Update existing problem
                          const updated = [...problemStatements]
                          updated[editingIndex] = currentProblem
                          setProblemStatements(updated)
                        } else {
                          // Add new problem
                          setProblemStatements([...problemStatements, currentProblem])
                        }
                        setShowProblemForm(false)
                        setEditingIndex(null)
                        setCurrentProblem({
                          title: '',
                          description: '',
                          inputFormat: '',
                          outputFormat: '',
                          constraints: '',
                          sampleInput: '',
                          sampleOutput: '',
                          explanation: '',
                          sampleTestCases: [],
                          hiddenTestCases: [],
                          timeLimit: 1,
                          memoryLimit: 256,
                          allowedLanguages: ['C', 'C++', 'Java', 'Python'],
                          resources: ''
                        })
                      } else {
                        alert('Please fill in at least title and description')
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingIndex !== null ? 'Update Problem' : 'Save Problem'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProblemForm(false)
                      setEditingIndex(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Problems List */}
            {problemStatements.length > 0 ? (
              <div className="space-y-4">
                {problemStatements.map((problem, index) => (
                  <div key={index} className="p-4 bg-white border border-gray-300 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{index + 1}. {problem.title}</h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentProblem(problem)
                            setEditingIndex(index)
                            setShowProblemForm(true)
                          }}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProblemStatements(problemStatements.filter((_, i) => i !== index))
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{problem.description}</p>
                    <div className="text-xs text-gray-500 flex gap-4">
                      <span>⏱️ {problem.timeLimit}s</span>
                      <span>💾 {problem.memoryLimit}MB</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No problems added yet. Add at least one coding problem to continue.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/organizer')}
              className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
