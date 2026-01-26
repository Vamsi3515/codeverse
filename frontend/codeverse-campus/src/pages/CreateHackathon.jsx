import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import OfflineLocationPicker from '../components/OfflineLocationPicker'

const API_URL = 'http://localhost:5000/api'

/*
  CreateHackathon.jsx - Simplified hackathon creation form
  - Matches exact requirements for CodeVerse Campus
  - Creates and publishes hackathons directly
  - Auto-assigns status as 'scheduled'
  - Offline hackathons require location details
*/

export default function CreateHackathon(){
  const navigate = useNavigate()
  
  // Check user role on component mount
  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    const allowedRoles = ['organizer', 'ORGANIZER', 'STUDENT_COORDINATOR']
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      setError('You are not authorized to create hackathons')
      setTimeout(() => {
        navigate('/dashboard/student')
      }, 2000)
    }
  }, [navigate])
  
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
  const [registrationFee, setRegistrationFee] = useState('0')
  const [rules, setRules] = useState('')

  // Problem Statements (for ONLINE mode)
  const [problemStatements, setProblemStatements] = useState([])
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
  const [currentTestCase, setCurrentTestCase] = useState({ input: '', output: '', isHidden: false })
  const [tabSwitchAllowed, setTabSwitchAllowed] = useState(true)
  const [copyPasteAllowed, setCopyPasteAllowed] = useState(true)
  const [fullScreenRequired, setFullScreenRequired] = useState(false)

  // Schedule
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [competitionDurationHours, setCompetitionDurationHours] = useState('')
  const [competitionDurationMinutes, setCompetitionDurationMinutes] = useState('')

  // UI State
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftHackathonId, setDraftHackathonId] = useState(null)
  const [showProblemForm, setShowProblemForm] = useState(false)

  const handleHackathonImageChange = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Only .jpg, .jpeg, .png, and .webp files are allowed')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setHackathonImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setHackathonImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload image
    await uploadHackathonImage(file)
  }

  const uploadHackathonImage = async (file) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('hackathonImage', file)

      const response = await fetch('http://localhost:5000/api/auth/upload-hackathon-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setHackathonImageUrl(data.imageUrl)
        console.log('✅ Hackathon image uploaded:', data.imageUrl)
      } else {
        alert(data.message || 'Failed to upload hackathon image')
        setHackathonImage(null)
        setHackathonImagePreview('')
      }
    } catch (error) {
      alert('Failed to upload hackathon image. Please try again.')
      setHackathonImage(null)
      setHackathonImagePreview('')
    } finally {
      setUploadingImage(false)
    }
  }

  const handlePublish = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    console.log('\n📋 Publishing Hackathon - Skipping all client validations')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to create a hackathon')
        navigate('/login/organizer')
        return
      }

      console.log('✅ Validation checks skipped')
      console.log('📦 Draft Hackathon ID:', draftHackathonId)

      // If draft exists, update and publish it. Otherwise, create new hackathon
      if (draftHackathonId) {
        console.log('📝 Updating existing draft hackathon:', draftHackathonId)
        
        // Update the draft hackathon with complete details
        // NOTE: Don't send problemStatements - they're already saved in DB!
        const competitionMinutes = (parseInt(competitionDurationHours || 0) * 60) + parseInt(competitionDurationMinutes || 0)
        const updateData = {
          title: title,
          description: description,
          college: localStorage.getItem('userCollege') || 'Unknown College',
          mode: mode,
          startDate: startDateTime,
          endDate: endDateTime,
          registrationStartDate: new Date().toISOString(),
          registrationEndDate: startDateTime,
          duration: calculateDuration(startDateTime, endDateTime),
          ...(competitionMinutes > 0 ? { competitionDuration: competitionMinutes } : {}),
          location: mode === 'offline' ? offlineLocation : null,
          ...(mode === 'offline' || mode === 'hybrid' ? { maxParticipants: 100 } : {}),
          registrationFee: parseInt(registrationFee) || 0,
          participationType: participationType.toUpperCase(),
          minTeamSize: participationType === 'team' ? parseInt(minTeamSize) : 1,
          maxTeamSize: participationType === 'team' ? parseInt(maxTeamSize) : 1,
          rules: rules ? rules.split('\n').filter(Boolean) : ['Follow standard hackathon guidelines'],
          prizes: { first: 'TBA', second: 'TBA', third: 'TBA' },
          antiCheatRules: {
            tabSwitchAllowed: tabSwitchAllowed,
            copyPasteAllowed: copyPasteAllowed,
            fullScreenRequired: fullScreenRequired,
            tabSwitchLimit: tabSwitchAllowed ? 0 : 5,
            copyPasteRestricted: !copyPasteAllowed,
            screenShareRequired: false,
            activityTracking: true,
            webcamRequired: false,
          },
          tags: [mode, participationType],
          bannerImage: hackathonImageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
          // DON'T send problemStatements - they're already in the database!
        }

        console.log('📤 Sending update data:', updateData)

        // Update draft hackathon
        const updateResponse = await fetch(`${API_URL}/hackathons/${draftHackathonId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })

        const updateResult = await updateResponse.json()
        console.log('📡 Update response:', updateResult)

        // Do not block on update errors to keep flow smooth

        // Now publish the hackathon
        console.log('🚀 Publishing hackathon...')
        const publishResponse = await fetch(`${API_URL}/hackathons/${draftHackathonId}/publish`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const publishResult = await publishResponse.json()
        console.log('📡 Publish response:', publishResult)

        if (publishResult.success) {
          setMessage('Hackathon published successfully!')
          setTimeout(() => {
            navigate('/dashboard/organizer')
          }, 1500)
        } else {
          setError(publishResult.message || 'Failed to publish hackathon')
        }
        
        setLoading(false)
        return
      }

      console.log('📝 Creating new hackathon (no draft exists)')

      // Prepare hackathon data matching backend schema
      const competitionMinutesNew = (parseInt(competitionDurationHours || 0) * 60) + parseInt(competitionDurationMinutes || 0)
      const hackathonData = {
        title: title,
        description: description,
        college: localStorage.getItem('userCollege') || 'Unknown College',
        mode: mode,
        startDate: startDateTime,
        endDate: endDateTime,
        registrationStartDate: new Date().toISOString(),
        registrationEndDate: startDateTime,
        duration: calculateDuration(startDateTime, endDateTime),
        ...(competitionMinutesNew > 0 ? { competitionDuration: competitionMinutesNew } : {}),
        location: mode === 'offline' ? offlineLocation : null,
        // Only include maxParticipants for OFFLINE/HYBRID hackathons
        // For ONLINE hackathons, maxParticipants is not needed
        ...(mode === 'offline' || mode === 'hybrid' ? { maxParticipants: 100 } : {}),
        registrationFee: parseInt(registrationFee) || 0,
        participationType: participationType.toUpperCase(),
        minTeamSize: participationType === 'team' ? parseInt(minTeamSize) : 1,
        maxTeamSize: participationType === 'team' ? parseInt(maxTeamSize) : 1,
        rules: rules ? rules.split('\n').filter(Boolean) : ['Follow standard hackathon guidelines'],
        problemStatements: mode === 'online' ? problemStatements : [],
        prizes: { first: 'TBA', second: 'TBA', third: 'TBA' },
        antiCheatRules: {
          tabSwitchAllowed: tabSwitchAllowed,
          copyPasteAllowed: copyPasteAllowed,
          fullScreenRequired: fullScreenRequired,
          tabSwitchLimit: tabSwitchAllowed ? 0 : 5,
          copyPasteRestricted: !copyPasteAllowed,
          screenShareRequired: false,
          activityTracking: true,
          webcamRequired: false,
        },
        tags: [mode, participationType],
        bannerImage: hackathonImageUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
        publish: true, // Auto-publish
      }

      // Create and publish hackathon
      const response = await fetch(`${API_URL}/hackathons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hackathonData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Hackathon published successfully!')
        setTimeout(() => {
          navigate('/dashboard/organizer')
        }, 1500)
      } else {
        setError(data.message || 'Failed to create hackathon')
      }
    } catch (err) {
      console.error('Error creating hackathon:', err)
      setError('Failed to create hackathon. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateDuration = (start, end) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const hours = Math.abs(endDate - startDate) / 36e5
    return Math.round(hours)
  }

  // Problem Statement Management Functions
  const addProblemStatement = async () => {
    console.log('🔍 Add Problem Statement clicked')
    console.log('Current Problem:', currentProblem)
    setError('')
    console.log('⚡ Skipping problem validations')

    // Create draft hackathon first if not exists
    let hackathonId = draftHackathonId
    if (!hackathonId) {
      console.log('📝 No draft hackathon yet, creating one...')
      hackathonId = await createDraftHackathon()
      if (!hackathonId) {
        console.log('❌ Failed to create draft hackathon')
        return
      }
      console.log('✅ Draft hackathon created with ID:', hackathonId)
    }

    console.log('🎯 Using hackathon ID:', hackathonId)
    setLoading(true)
    console.log('🚀 Sending problem to API...')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('You must be logged in to add problems')
        setLoading(false)
        return
      }

      const payload = {
        title: currentProblem.title.trim(),
        description: currentProblem.description.trim(),
        inputFormat: currentProblem.inputFormat.trim(),
        outputFormat: currentProblem.outputFormat.trim(),
        constraints: currentProblem.constraints.trim(),
        sampleInput: currentProblem.sampleInput.trim(),
        sampleOutput: currentProblem.sampleOutput.trim(),
        explanation: currentProblem.explanation.trim(),
        sampleTestCases: currentProblem.sampleTestCases,
        hiddenTestCases: currentProblem.hiddenTestCases,
        timeLimit: currentProblem.timeLimit,
        memoryLimit: currentProblem.memoryLimit,
        allowedLanguages: currentProblem.allowedLanguages,
        resources: currentProblem.resources.trim() ? currentProblem.resources.split('\n').filter(Boolean) : []
      }

      console.log('📦 Payload:', payload)

      const response = await fetch(`${API_URL}/hackathons/${hackathonId}/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log('📡 Response status:', response.status)
      const data = await response.json()
      console.log('📡 Response data:', data)

      if (data.success) {
        console.log('✅ Problem added successfully!')
        setMessage(`✅ Problem "${currentProblem.title}" added successfully!`)
        setProblemStatements([...problemStatements, data.problem])
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
        setCurrentTestCase({ input: '', output: '', isHidden: false })
        setShowProblemForm(false)
        setError('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => setMessage(''), 3000)
      } else {
        console.log('❌ API returned error:', data.message)
        setError(data.message || 'Failed to add problem')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error('❌ Error adding problem:', err)
      setError('Error adding problem: ' + err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const createDraftHackathon = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log('🔐 Token:', token ? '✅ Present' : '❌ Missing')
      console.log('📝 Creating draft with title:', title.trim())
      
      const response = await fetch(`${API_URL}/hackathons/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description || 'Draft hackathon',
          mode,
          startDate: startDateTime || undefined,
          endDate: endDateTime || undefined,
          participationType,
          minTeamSize,
          maxTeamSize,
        }),
      })

      console.log('📡 Draft creation response status:', response.status)
      const data = await response.json()
      console.log('📡 Draft creation response:', data)
      
      if (data.success) {
        console.log('✅ Draft created with ID:', data.hackathon._id)
        setDraftHackathonId(data.hackathon._id)
        setMessage('📝 Draft created! Now add coding problems.')
        setTimeout(() => setMessage(''), 3000)
        return data.hackathon._id
      } else {
        console.log('❌ Draft creation failed:', data.message)
        setError(data.message || 'Failed to create draft')
        return null
      }
    } catch (err) {
      setError('Error creating draft: ' + err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const removeProblemStatement = (index) => {
    setProblemStatements(problemStatements.filter((_, i) => i !== index))
  }

  const addTestCase = () => {
    // Clear previous error
    setError('')
    
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

  const toggleLanguage = (lang) => {
    const languages = currentProblem.allowedLanguages.includes(lang)
      ? currentProblem.allowedLanguages.filter(l => l !== lang)
      : [...currentProblem.allowedLanguages, lang]
    setCurrentProblem({ ...currentProblem, allowedLanguages: languages })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Hackathon</h1>
          <p className="text-gray-600 mt-2">Configure and publish your hackathon</p>
        </header>

        {/* Success/Error Messages */}
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

        <form onSubmit={handlePublish} className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* Section 1: Basic Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hackathon Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={title}
                  onChange={e=>setTitle(e.target.value)}
                  placeholder="Enter hackathon title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  rows={4}
                  value={description}
                  onChange={e=>setDescription(e.target.value)}
                  placeholder="Describe your hackathon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hackathon Image (Optional)
                </label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleHackathonImageChange}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    value={mode}
                    onChange={e=>setMode(e.target.value)}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participation Type
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    value={participationType}
                    onChange={e=>setParticipationType(e.target.value)}
                  >
                    <option value="solo">Solo</option>
                    <option value="team">Team</option>
                  </select>
                </div>
              </div>

              {participationType === 'team' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">Team Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Team Size
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        value={minTeamSize}
                        onChange={e=>setMinTeamSize(Math.max(1, parseInt(e.target.value) || 2))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Team Size
                      </label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        value={maxTeamSize}
                        onChange={e=>setMaxTeamSize(Math.max(minTeamSize, parseInt(e.target.value) || 4))}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Students will be required to form teams between {minTeamSize} and {maxTeamSize} members
                  </p>
                </div>
              )}

              {(mode === 'offline' || mode === 'hybrid') && (
                <OfflineLocationPicker
                  onLocationSelect={setOfflineLocation}
                  existingLocation={offlineLocation}
                />
              )}

              {/* Coding Problem Statements Section - Only for ONLINE Mode */}
              {mode === 'online' && (
                <div className="border border-gray-200 rounded-lg p-6 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Coding Problem Statements <span className="text-red-500">*</span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Design coding problems for students to solve</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${problemStatements.length === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {problemStatements.length} added
                    </span>
                  </div>

                  {/* Add New Problem Button */}
                  {!showProblemForm && (
                    <button
                      type="button"
                      onClick={() => setShowProblemForm(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      + Add New Coding Problem
                    </button>
                  )}

                  {/* Add Problem Form */}
                  {showProblemForm && (
                    <div className="bg-gray-50 rounded-lg p-5 mb-4 space-y-4 border border-gray-200">
                    {/* 1. Problem Details */}
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Problem Details</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Problem Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={currentProblem.title}
                            onChange={e => setCurrentProblem({...currentProblem, title: e.target.value})}
                            placeholder="e.g., Two Sum Problem"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Problem Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={currentProblem.description}
                            onChange={e => setCurrentProblem({...currentProblem, description: e.target.value})}
                            placeholder="Describe what the problem is asking students to solve..."
                            rows="3"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Input Format <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={currentProblem.inputFormat}
                              onChange={e => setCurrentProblem({...currentProblem, inputFormat: e.target.value})}
                              placeholder="First line: integer N&#10;Second line: N space-separated integers"
                              rows="2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Output Format <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              value={currentProblem.outputFormat}
                              onChange={e => setCurrentProblem({...currentProblem, outputFormat: e.target.value})}
                              placeholder="Single line: the result"
                              rows="2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Constraints
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={currentProblem.constraints}
                            onChange={e => setCurrentProblem({...currentProblem, constraints: e.target.value})}
                            placeholder="1 ≤ N ≤ 10^5&#10;-10^9 ≤ arr[i] ≤ 10^9"
                            rows="2"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sample Input
                            </label>
                            <textarea
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                              value={currentProblem.sampleInput}
                              onChange={e => setCurrentProblem({...currentProblem, sampleInput: e.target.value})}
                              placeholder="5&#10;1 2 3 4 5"
                              rows="2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sample Output
                            </label>
                            <textarea
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                              value={currentProblem.sampleOutput}
                              onChange={e => setCurrentProblem({...currentProblem, sampleOutput: e.target.value})}
                              placeholder="15"
                              rows="2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Explanation
                          </label>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={currentProblem.explanation}
                            onChange={e => setCurrentProblem({...currentProblem, explanation: e.target.value})}
                            placeholder="Explain the sample test case..."
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Test Cases Configuration */}
                    <div className="border-b border-gray-200 pb-4">
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

                      <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
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
                                    className="text-gray-500 hover:text-red-600"
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
                            {currentProblem.sampleTestCases.length === 0 && (
                              <p className="text-xs text-gray-500">No sample test cases added</p>
                            )}
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
                                    className="text-gray-500 hover:text-red-600"
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
                            {currentProblem.hiddenTestCases.length === 0 && (
                              <p className="text-xs text-gray-500">No hidden test cases added</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Execution Limits */}
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">⚡ Execution Limits</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Limit (seconds)
                          </label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={currentProblem.timeLimit}
                            onChange={e => setCurrentProblem({...currentProblem, timeLimit: parseFloat(e.target.value) || 1})}
                          />
                          <p className="text-xs text-gray-500 mt-1">Fair evaluation time limit</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Memory Limit (MB)
                          </label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={currentProblem.memoryLimit}
                            onChange={e => setCurrentProblem({...currentProblem, memoryLimit: parseInt(e.target.value) || 256})}
                          />
                          <p className="text-xs text-gray-500 mt-1">Maximum memory usage allowed</p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Language Selection */}
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-gray-900 mb-3">🧑‍💻 Allowed Programming Languages</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['C', 'C++', 'Java', 'Python'].map(lang => (
                          <label key={lang} className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100">
                            <input
                              type="checkbox"
                              checked={currentProblem.allowedLanguages.includes(lang)}
                              onChange={() => toggleLanguage(lang)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">{lang}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Students can solve in any selected language</p>
                    </div>

                    {/* 5. Additional Resources */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📚 Additional Resources (Optional)</h4>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={currentProblem.resources}
                        onChange={e => setCurrentProblem({...currentProblem, resources: e.target.value})}
                        placeholder="Add helpful links (one per line)&#10;https://docs.python.org&#10;https://cppreference.com"
                        rows="2"
                      />
                      <p className="text-xs text-gray-500 mt-1">Provide helpful documentation or references</p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={addProblemStatement}
                        disabled={loading}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-bold transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? '⏳ Adding...' : '✅ Save Problem to Database'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProblemForm(false)
                          setError('')
                        }}
                        className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                  )}

                  {/* Problem Statements List */}
                  {problemStatements.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Added Problems
                        </h4>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {problemStatements.length}
                        </span>
                      </div>

                      {problemStatements.map((problem, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">
                                {problem.title}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">{problem.description.substring(0, 80)}...</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProblemStatement(index)}
                              className="text-red-600 hover:text-red-700 text-xs font-medium ml-4 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-gray-500">Test Cases:</span>
                              <p className="text-gray-900 font-medium">{problem.sampleTestCases?.length || 0} / {problem.hiddenTestCases?.length || 0}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Limits:</span>
                              <p className="text-gray-900 font-medium">{problem.timeLimit}s / {problem.memoryLimit}MB</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Languages:</span>
                              <p className="text-gray-900 font-medium">{problem.allowedLanguages?.join(', ')}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setShowProblemForm(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
                      >
                        + Add Another Problem
                      </button>
                    </div>
                  )}

                  {problemStatements.length === 0 && !showProblemForm && (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">
                        No problems added yet. Add at least one coding problem to continue.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Fee (₹)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={registrationFee}
                  onChange={e=>setRegistrationFee(e.target.value)}
                  placeholder="0 for free"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Schedule */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={startDateTime}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => {
                    console.log('📅 Start DateTime Changed:', e.target.value)
                    setStartDateTime(e.target.value)
                    // If end date is set and is before start + 24 hours, clear it
                    if (endDateTime) {
                      const startDate = new Date(e.target.value);
                      const endDate = new Date(endDateTime);
                      const minEndDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
                      if (endDate < minEndDate) {
                        setEndDateTime('');
                      }
                    }
                  }}
                />
                {startDateTime && <p className="text-xs text-green-600 mt-1">✅ {new Date(startDateTime).toLocaleString()}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  value={endDateTime}
                  disabled={!startDateTime}
                  min={startDateTime ? new Date(new Date(startDateTime).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                  onChange={e => {
                    console.log('📅 End DateTime Changed:', e.target.value)
                    const endDate = new Date(e.target.value);
                    const startDate = new Date(startDateTime);
                    const minEndDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                    
                    // Only set if end date is at least 24 hours after start date
                    if (endDate >= minEndDate) {
                      setEndDateTime(e.target.value)
                    }
                  }}
                />
                {endDateTime && <p className="text-xs text-green-600 mt-1">✅ {new Date(endDateTime).toLocaleString()}</p>}
                {startDateTime && !endDateTime && <p className="text-xs text-gray-500 mt-1">Must be at least 24 hours after start date</p>}
                {!startDateTime && <p className="text-xs text-gray-400 mt-1">Select start date first</p>}
              </div>
            </div>

            {/* Competition Duration (Optional) */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
          </div>

          {/* Section 3: Rules */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rules</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hackathon Rules
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                rows={4}
                value={rules}
                onChange={e=>setRules(e.target.value)}
                placeholder="Enter rules (one per line)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter each rule on a new line</p>
            </div>
          </div>

          {/* Section 4: Anti-Cheating Options */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Anti-Cheating Configuration</h2>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                  checked={tabSwitchAllowed}
                  onChange={e=>setTabSwitchAllowed(e.target.checked)}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Allow Tab Switching</div>
                  <div className="text-xs text-gray-500">Participants can switch between tabs</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                  checked={copyPasteAllowed}
                  onChange={e=>setCopyPasteAllowed(e.target.checked)}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Allow Copy-Paste</div>
                  <div className="text-xs text-gray-500">Participants can copy and paste code</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-sky-600 rounded focus:ring-2 focus:ring-sky-500"
                  checked={fullScreenRequired}
                  onChange={e=>setFullScreenRequired(e.target.checked)}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Require Full Screen</div>
                  <div className="text-xs text-gray-500">Participants must stay in full screen mode</div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Hackathon'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dashboard/organizer')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
