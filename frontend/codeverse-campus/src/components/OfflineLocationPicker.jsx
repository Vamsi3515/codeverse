import React, { useState, useEffect } from 'react'

export default function OfflineLocationPicker({ onLocationSelect, existingLocation }) {
  const [venueName, setVenueName] = useState(existingLocation?.venueName || '')
  const [address, setAddress] = useState(existingLocation?.address || '')
  const [city, setCity] = useState(existingLocation?.city || '')
  const [latitude, setLatitude] = useState(existingLocation?.latitude || '')
  const [longitude, setLongitude] = useState(existingLocation?.longitude || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ✅ Update internal state when existingLocation changes (for edit page auto-fill)
  useEffect(() => {
    if (existingLocation) {
      setVenueName(existingLocation.venueName || '')
      setAddress(existingLocation.address || '')
      setCity(existingLocation.city || '')
      setLatitude(existingLocation.latitude || '')
      setLongitude(existingLocation.longitude || '')
    }
  }, [existingLocation])

  // Optional Google Geocoding (requires VITE_GOOGLE_MAPS_API_KEY)
  const googleApiKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY

  const handleGetLocation = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate that venue details are filled
    if (!venueName.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in Venue Name, Address, and City first')
      setLoading(false)
      return
    }

    try {
      // Normalize inputs
      const cleanedVenue = venueName.trim()
      const cleanedAddress = address.trim()
      const cleanedCity = city.trim()

      // Four address formats to maximize matches
      const addressFormats = [
        `${cleanedVenue}, ${cleanedAddress}, ${cleanedCity}, India`,
        `${cleanedAddress}, ${cleanedCity}, India`,
        `${cleanedVenue}, ${cleanedCity}, India`,
        `${cleanedCity}, India`
      ].filter(Boolean)

      console.log('🔍 [GEOCODING] Attempting providers with multiple formats...')

      const providers = []

      // Provider 1: Google Geocoding (only if API key present)
      if (googleApiKey) {
        providers.push({
          name: 'GoogleGeocoding',
          lookup: async (addr) => {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${googleApiKey}`
            const res = await fetch(url)
            const data = await res.json()
            if (data.status === 'OK' && data.results?.length) {
              const loc = data.results[0].geometry.location
              return {
                lat: loc.lat,
                lng: loc.lng,
                label: data.results[0].formatted_address
              }
            }
            throw new Error(`Google status: ${data.status}`)
          }
        })
      }

      // Provider 2: Nominatim (no key)
      providers.push({
        name: 'Nominatim',
        lookup: async (addr) => {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'CodeVerse-Campus-Hackathon-Platform' }
          })
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            return {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
              label: data[0].display_name
            }
          }
          throw new Error('Nominatim empty')
        }
      })

      let found = false
      for (const addr of addressFormats) {
        if (found) break
        for (const provider of providers) {
          if (found) break
          try {
            console.log(`📡 [GEOCODING] Provider ${provider.name} ->`, addr)
            const result = await provider.lookup(addr)
            if (result?.lat && result?.lng) {
              setLatitude(result.lat)
              setLongitude(result.lng)
              setSuccess(`✅ Found via ${provider.name}: ${result.label || addr}`)
              found = true
              break
            }
          } catch (provErr) {
            console.warn(`⚠️ [GEOCODING] ${provider.name} failed for ${addr}:`, provErr?.message || provErr)
          }
        }
      }

      if (!found) {
        setError('❌ Could not find coordinates automatically. Please enter them manually or open Google Maps and copy the coordinates.')
        setSuccess('💡 Tip: In Google Maps, search your venue, right-click exact spot, copy the first (latitude) and second (longitude) numbers.')
      }
    } catch (err) {
      console.error('❌ [GEOCODING] Error:', err)
      setError('Failed to geocode address. Please enter coordinates manually.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!venueName.trim() || !address.trim() || !city.trim() || !latitude || !longitude) {
      setError('All fields are required')
      return
    }

    onLocationSelect({
      venueName,
      address,
      city,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    })

    setError('')
    setSuccess('✅ Location saved!')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Offline Hackathon Location</h3>
      <p className="text-sm text-gray-600">
        Provide the venue details and coordinates for your offline hackathon
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="e.g., Main Auditorium, Tech Park A"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., New Delhi, Bangalore"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Full venue address with street, building number, etc."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="e.g., 28.6139"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="e.g., 77.2090"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700 font-medium">💡 How to get coordinates:</p>
        <div className="text-xs text-blue-600 mt-1 space-y-1">
          <p><strong>Option 1:</strong> Fill venue details above and click "Get Coordinates"</p>
          <p><strong>Option 2:</strong> Get from Google Maps:</p>
          <ol className="list-decimal ml-4 mt-1">
            <li>Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a></li>
            <li>Search for your venue</li>
            <li>Right-click on the exact location</li>
            <li>Click the coordinates shown (they'll be copied)</li>
            <li>Paste here - First number is Latitude, Second is Longitude</li>
          </ol>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleGetLocation}
          disabled={loading || !venueName.trim() || !address.trim() || !city.trim()}
          className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          {loading ? '🔄 Fetching Coordinates...' : '📍 Get Coordinates from Address'}
        </button>

        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          ✅ Save Location
        </button>
      </div>

      {latitude && longitude && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700 font-medium">📍 Coordinates Set</p>
          <p className="text-xs text-blue-600 mt-1">
            Latitude: {latitude} | Longitude: {longitude}
          </p>
        </div>
      )}
    </div>
  )
}
