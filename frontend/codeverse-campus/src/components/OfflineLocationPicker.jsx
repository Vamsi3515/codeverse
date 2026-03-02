import React, { useState, useEffect, useRef } from 'react'

export default function OfflineLocationPicker({ onLocationSelect, existingLocation }) {
  const [venueName, setVenueName] = useState(existingLocation?.venueName || '')
  const [address, setAddress] = useState(existingLocation?.address || '')
  const [city, setCity] = useState(existingLocation?.city || '')
  const [latitude, setLatitude] = useState(existingLocation?.latitude || '')
  const [longitude, setLongitude] = useState(existingLocation?.longitude || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)

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

  // Load Google Maps SDK when map picker is opened
  useEffect(() => {
    if (showMapPicker) {
      setMapLoaded(false)
      const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      console.log('Google Maps API Key:', googleApiKey)
      if (!googleApiKey) {
        setError('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to .env')
        return
      }
      
      // Only load script if Google Maps is not already loaded
      if (!window.google) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
          console.log('Google Maps SDK loaded')
          setTimeout(() => initializeMap(), 500) // Wait for DOM ready
        }
        script.onerror = () => {
          setError('Failed to load Google Maps. Check your API key.')
        }
        document.head.appendChild(script)
      } else {
        // Google Maps already loaded, just initialize
        setTimeout(() => initializeMap(), 300)
      }
    }
  }, [showMapPicker])

  // Initialize Google Map
  const initializeMap = () => {
    if (!mapRef.current || !window.google) {
      console.warn('Map ref or Google Maps not ready')
      return
    }

    try {
      const defaultLat = latitude ? parseFloat(latitude) : 28.6139
      const defaultLng = longitude ? parseFloat(longitude) : 77.2090
      
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: defaultLat, lng: defaultLng },
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
        streetViewControl: false
      })

      // Add existing marker if coordinates exist
      if (latitude && longitude) {
        createMarker(parseFloat(latitude), parseFloat(longitude), 'Selected Location')
      }

      // Click to select location
      mapInstance.current.addListener('click', (event) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        createMarker(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        reverseGeocode(lat, lng, null)
      })

      // Add search functionality
      const searchInput = document.getElementById('map-search-input')
      if (searchInput && window.google.maps.places) {
        const searchBox = new window.google.maps.places.SearchBox(searchInput)
        
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces()
          if (places.length === 0) return

          const place = places[0]
          if (!place.geometry || !place.geometry.location) return

          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          
          mapInstance.current.setCenter({ lat, lng })
          mapInstance.current.setZoom(17)
          createMarker(lat, lng, place.name || place.formatted_address)
          reverseGeocode(lat, lng, place.name || place.formatted_address)
        })
      }

      console.log('Map initialized successfully')
      setMapLoaded(true)
    } catch (err) {
      console.error('Map initialization error:', err)
      setError('Failed to initialize map: ' + err.message)
      setMapLoaded(false)
    }
  }

  // Create or update marker on map
  const createMarker = (lat, lng, title) => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng })
    } else if (mapInstance.current) {
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: title,
        draggable: true
      })

      // Update coordinates when marker is dragged
      markerRef.current.addListener('dragend', () => {
        const pos = markerRef.current.getPosition()
        setLatitude(pos.lat())
        setLongitude(pos.lng())
        reverseGeocode(pos.lat(), pos.lng(), null)
      })
    }
  }

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lng, placeName = null) => {
    try {
      const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
      )
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const fullAddress = result.formatted_address
        
        // Extract city from address components
        let extractedCity = city
        result.address_components.forEach(component => {
          if (component.types.includes('locality')) {
            extractedCity = component.long_name
          }
        })
        
        // Use provided place name or extract from address
        const venueName = placeName || result.address_components[0]?.long_name || fullAddress.split(',')[0]
        
        setVenueName(venueName)
        setAddress(fullAddress)
        setCity(extractedCity)
        setLatitude(lat.toFixed(6))
        setLongitude(lng.toFixed(6))
        setSuccess(`Location selected: ${fullAddress}`)
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
    }
  }

  // Confirm map selection and close picker
  const handleMapConfirm = () => {
    if (latitude && longitude) {
      setShowMapPicker(false)
      setMapLoaded(false)
      setSuccess('Location updated from map')
    } else {
      setError('Please select a location on the map')
    }
  }

  // Optional Google Geocoding (requires VITE_GOOGLE_MAPS_API_KEY)
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const handleGetLocation = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

 
    if (!venueName.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in Venue Name, Address, and City first')
      setLoading(false)
      return
    }

    try {
      
      const cleanedVenue = venueName.trim()
      const cleanedAddress = address.trim()
      const cleanedCity = city.trim()

     
      const addressFormats = [
        `${cleanedVenue}, ${cleanedAddress}, ${cleanedCity}, India`,
        `${cleanedAddress}, ${cleanedCity}, India`,
        `${cleanedVenue}, ${cleanedCity}, India`,
        `${cleanedCity}, India`
      ].filter(Boolean)

      console.log('🔍 [GEOCODING] Attempting providers with multiple formats...')

      const providers = []

      
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
              setSuccess(`Found via ${provider.name}: ${result.label || addr}`)
              found = true
              break
            }
          } catch (provErr) {
            console.warn(`⚠️ [GEOCODING] ${provider.name} failed for ${addr}:`, provErr?.message || provErr)
          }
        }
      }

      if (!found) {
        setError('Could not find coordinates automatically. Please enter them manually or use the map picker.')
        setSuccess('Tip: Use the map picker to visually select your venue location.')
      }
    } catch (err) {
      console.error('[GEOCODING] Error:', err)
      setError('Failed to geocode address. Please enter coordinates manually.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!venueName.trim() || !address.trim() || !city.trim() || !latitude || !longitude) {
      setError('Please complete location selection on the map first')
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
    setSuccess('Location saved successfully')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Offline Hackathon Location</h3>
        <p className="text-sm text-gray-600 mt-1">Select your venue location on the map</p>
      </div>

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

      <div className="space-y-4">
        {/* Venue Name - Read Only Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Venue Name
          </label>
          <input
            type="text"
            value={venueName}
            readOnly
            placeholder="(Select from map)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* City - Read Only Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            value={city}
            readOnly
            placeholder="(Select from map)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Address - Read Only Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            value={address}
            readOnly
            placeholder="(Select from map)"
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed resize-none"
          />
        </div>

        {/* Location Coordinates - Hidden but tracked */}
        {latitude && longitude && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 font-medium">
              Coordinates: {latitude}, {longitude}
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => setShowMapPicker(true)}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Select Location on Map
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!latitude || !longitude}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
        >
          Save Location
        </button>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Select Location</h2>
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="p-3 bg-white border-b border-gray-200">
              <input
                id="map-search-input"
                type="text"
                placeholder="Search for venue or address..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Map */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center relative" style={{ minHeight: '500px' }}>
              <div ref={mapRef} className="w-full h-full absolute inset-0"></div>
              {!mapLoaded && (
                <div className="text-center text-gray-500 relative z-10">
                  <p className="text-sm font-medium">Map not available</p>
                  <p className="text-xs mt-1">Use search above to find your venue</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMapConfirm}
                disabled={!latitude || !longitude}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
