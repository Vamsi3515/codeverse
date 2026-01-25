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
  const [mode, setMode] = useState('online')
  const [offlineLocation, setOfflineLocation] = useState(null)
  const [participationType, setParticipationType] = useState('team')
  const [minTeamSize, setMinTeamSize] = useState(2)
  const [maxTeamSize, setMaxTeamSize] = useState(4)
  const [maxParticipants, setMaxParticipants] = useState(100)
  const [registrationFee, setRegistrationFee] = useState('0')
  const [rules, setRules] = useState('')

  // Schedule
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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

        // Convert to datetime-local format
        if (h.startDate) {
          setStartDateTime(new Date(h.startDate).toISOString().slice(0, 16))
        }
        if (h.endDate) {
          setEndDateTime(new Date(h.endDate).toISOString().slice(0, 16))
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

      const hackathonData = {
        title,
        description,
        mode,
        startDate: startDateTime,
        endDate: endDateTime,
        duration: calculateDuration(startDateTime, endDateTime),
        location: mode === 'offline' ? offlineLocation : null,
        registrationFee: parseInt(registrationFee) || 0,
        maxParticipants: parseInt(maxParticipants) || 100,
        participationType: participationType.toUpperCase(),
        minTeamSize: participationType === 'team' ? parseInt(minTeamSize) : 1,
        maxTeamSize: participationType === 'team' ? parseInt(maxTeamSize) : 1,
        rules: rules ? rules.split('\n').filter(Boolean) : [],
      }

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
          <button onClick={() => navigate(-1)} className="text-sm text-sky-600 mb-4">← Back</button>
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
                onChange={(e) => setStartDateTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                required
              />
            </div>
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
              onClick={() => navigate(-1)}
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
