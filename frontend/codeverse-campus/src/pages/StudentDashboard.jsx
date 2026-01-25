import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SelfieVerifier from '../components/SelfieVerifier'
import FaceVerificationModal from '../components/FaceVerificationModal'
import TeamRegistrationModal from '../components/TeamRegistrationModal'
import QRCodeDisplay from '../components/QRCodeDisplay'
import RegistrationSuccessModal from '../components/RegistrationSuccessModal'
import QRCodeModal from '../components/QRCodeModal'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

// Helper function to get full image URL
function getFullImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Convert relative path to absolute backend URL
  const backendUrl = 'https://3z4snn71-5000.inc1.devtunnels.ms';
  return `${backendUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

const availableHackathons = [
  {
    id: 'h1',
    title: 'InnovateAI Hackathon',
    college: 'State Technical University',
    date: '2026-01-1',
    mode: 'Online',
    status: 'Upcoming',
    registered: false,
    image: 'https://i.pinimg.com/736x/7e/89/9e/7e899ec4e4580407fe330df18d2cee0b.jpg'
  },
  {
    id: 'h2',
    title: 'Campus CodeSprint',
    college: 'North College of Engineering',
    date: '2025-12-31',
    mode: 'Offline',
    status: 'Active',
    registered: true,
    image: 'https://i.pinimg.com/736x/c1/38/ad/c138ad87230eaba8b70d714335e5187f.jpg',
    location: {
      venueName: 'North College Main Campus',
      address: 'North College of Engineering Campus',
      city: 'Vizianagaram',
      latitude: 18.1165,
      longitude: 83.4117
    }
  },
  {
    id: 'h3',
    title: 'GreenTech Challenge',
    college: 'City University',
    date: '2025-11-25',
    mode: 'Online',
    status: 'Completed',
    registered: true,
    image: 'https://i.pinimg.com/736x/44/04/fc/4404fc4e8f85ed002a3d76b8b2c9fb59.jpg'
  },
  {
    id: 'h4',
    title: 'Campus Hack & Learn',
    college: 'Central College',
    date: '2026-02-05',
    mode: 'Offline',
    status: 'Upcoming',
    registered: false,
    image: 'https://i.pinimg.com/736x/83/58/fe/8358feeb3ef324913609c5fc1c666ac7.jpg',
    location: {
      venueName: 'Central College Auditorium',
      address: 'Central College Main Building',
      city: 'Vizianagaram',
      latitude: 18.1200,
      longitude: 83.4000
    }
  },
  {
    id: 'h5',
    title: 'UX/UI Sprint',
    college: 'Design Institute',
    date: '2026-03-22',
    mode: 'Online',
    status: 'Upcoming',
    registered: false,
    image: 'https://i.pinimg.com/736x/38/f9/13/38f913f969b14a6ca5af964cc5b3528a.jpg'
  },
  {
    id: 'h6',
    title: 'Fullstack Forge',
    college: 'Polytech Academy',
    date: '2025-12-23',
    mode: 'Offline',
    status: 'Active',
    registered: false,
    image: 'https://i.pinimg.com/736x/6b/34/e7/6b34e7afedd804669c159f6479ec8c8a.jpg',
    location: {
      venueName: 'Polytech Innovation Hub',
      address: 'Polytech Academy Campus',
      city: 'Vizianagaram',
      latitude: 18.1100,
      longitude: 83.4050
    }
  },
  {
    id: 'h7',
    title: 'DataDive Challenge',
    college: 'Analytics University',
    date: '2026-04-25',
    mode: 'Online',
    status: 'Upcoming',
    registered: false,
    image: 'https://i.pinimg.com/736x/f4/b1/65/f4b165e32d66692bbb32e39b0a77b9e1.jpg'
  },
  {
    id: 'h8',
    title: 'Robotics Rush',
    college: 'Tech Makers Institute',
    date: '2025-12-3',
    mode: 'Offline',
    status: 'Completed',
    registered: true,
    image: 'https://i.pinimg.com/1200x/a3/3d/cd/a33dcd1465e4f0da25b020cd9b109083.jpg',
    location: {
      venueName: 'Tech Makers Lab',
      address: 'Tech Makers Institute',
      city: 'Vizianagaram',
      latitude: 18.1050,
      longitude: 83.4100
    }
  },
  {
    id: 'h9',
    title: 'IoT Innovators',
    college: 'SmartU',
    date: '2026-05-10',
    mode: 'Online',
    status: 'Upcoming',
    registered: false,
    image: 'https://i.pinimg.com/736x/63/27/38/63273835837e88006ec5d0a03e7296f9.jpg'
  },
  {
    id: 'h10',
    title: 'CyberSec Sprint',
    college: 'Security College',
    date: '2025-12-31',
    mode: 'Online',
    status: 'Active',
    registered: true,
    image: 'https://i.pinimg.com/736x/b0/5c/1b/b05c1b569fff1b3b7e61150ba3e29b62.jpg'
  },
  {
    id: 'h11',
    title: 'Sustainability Hack',
    college: 'GreenTech College',
    date: '2026-06-02',
    mode: 'Offline',
    status: 'Upcoming',
    registered: false,
    image: 'https://i.pinimg.com/1200x/4e/19/d8/4e19d8b2d09ca5a48c1ffab01ea6de01.jpg',
    location: {
      venueName: 'GreenTech Campus Hall',
      address: 'GreenTech College',
      city: 'Vizianagaram',
      latitude: 18.1170,
      longitude: 83.4120
    }
  },
  {
    id: 'h12',
    title: 'Mobile Makers Marathon',
    college: 'AppDev Institute',
    date: '2025-08-20',
    mode: 'Offline',
    status: 'Completed',
    registered: true,
    image: 'https://i.pinimg.com/736x/cc/e5/e2/cce5e274d7963fc7bf7cf2c1f8bbed18.jpg',
    location: {
      venueName: 'AppDev Conference Center',
      address: 'AppDev Institute',
      city: 'Vizianagaram',
      latitude: 18.1000,
      longitude: 83.3950
    }
  }
]

// removed top-level myHackathons; will derive inside component from local state

const notifications = [
  { id: 1, text: 'Registration confirmed for Campus CodeSprint' },
  { id: 2, text: 'GreenTech Challenge results published' },
  { id: 3, text: 'Join InnovateAI Hackathon starting Jan 18' }
]

const results = [
  { id: 'r1', title: 'GreenTech Challenge', rank: 5, score: 86, certificate: 'Ready' },
  { id: 'r2', title: 'Robotics Rush', rank: 12, score: 72, certificate: 'Ready' },
  { id: 'r3', title: 'Mobile Makers Marathon', rank: 0, score: 0, certificate: 'Pending' }
]

// Static student location (mock)
const studentLocation = {
  college: 'State Technical University',
  city: 'Vizianagaram',
  latitude: 18.1124,
  longitude: 83.3956
}

// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2){
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

export default function StudentDashboard(){
  const [tab, setTab] = useState('All Hackathons')
  const [query, setQuery] = useState('')
  const [qrModal, setQrModal] = useState({ open: false, item: null, qrCode: null, registration: null, loading: false })
  const [qrDisplayModal, setQrDisplayModal] = useState({ open: false, hackathon: null, registration: null })
  const [resultModal, setResultModal] = useState({ open: false, item: null })
  const [distanceModal, setDistanceModal] = useState({ open: false, hackathon: null, distance: '' })
  const [verifier, setVerifier] = useState({ open: false, hackathon: null })
  const [faceVerificationModal, setFaceVerificationModal] = useState({ open: false, hackathon: null })
  const [userProfile, setUserProfile] = useState(null)
  const [registeredHackathons, setRegisteredHackathons] = useState([])
  const [registrationModal, setRegistrationModal] = useState({ open: false, hackathon: null })
  const [registrationSuccessModal, setRegistrationSuccessModal] = useState({ open: false, hackathon: null, registration: null })
  const [apiHackathons, setApiHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { userName } = useAuth()

  useEffect(() => {
    console.log('🔍 [DASHBOARD INIT] ComponentDidMount - Fetching hackathons...');
    // Fetch hackathons from API
    fetchHackathons()
    // Fetch user profile for face verification
    fetchUserProfile()
    // initialize from localStorage if present, otherwise from static data
    try{
      const raw = localStorage.getItem('registeredHackathons')
      if(raw){
        const parsed = JSON.parse(raw)
        setRegisteredHackathons(Array.isArray(parsed) ? parsed : [])
        return
      }
    }catch(e){}
    const initial = availableHackathons.filter(h => h.registered).map(h => h.id)
    setRegisteredHackathons(initial)
  }, [])

  const fetchHackathons = async () => {
    console.log('📡 [API CALL] Starting fetchHackathons...');
    try {
      const response = await fetch(`${API_URL}/hackathons/available`)
      const data = await response.json()
      console.log('📡 [API RESPONSE] Success:', data.success);
      console.log('📡 [API RESPONSE] Raw hackathons count:', data.hackathons?.length || 0);
      console.log('📡 [API RESPONSE] Full response:', data);
      
      if (data.success) {
        console.log('✅ [API SUCCESS] Processing', data.hackathons.length, 'hackathons...');
        
        // Transform API hackathons to match the expected format
        const transformedHackathons = data.hackathons.map((h, idx) => {
          console.log(`🔄 [TRANSFORM ${idx + 1}] Raw hackathon:`, h);
          const transformed = {
            id: h._id,
            _id: h._id,
            title: h.title,
            college: h.college,
            date: h.startDate,
            startDate: h.startDate,
            endDate: h.endDate,
            mode: h.mode.charAt(0).toUpperCase() + h.mode.slice(1), // Capitalize
            status: h.displayStatus || 'Upcoming',
            participationType: h.participationType,
            minTeamSize: h.minTeamSize,
            maxTeamSize: h.maxTeamSize,
            registeredCount: h.registeredCount,
            maxParticipants: h.maxParticipants,
            image: h.bannerImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
            latitude: h.location?.latitude,
            longitude: h.location?.longitude,
            location: h.location // Include full location object
          };
          console.log(`🔄 [TRANSFORM ${idx + 1}] Transformed hackathon:`, transformed);
          console.log(`🔄 [TRANSFORM ${idx + 1}] Location data:`, transformed.location);
          return transformed;
        });
        
        console.log('✅ [TRANSFORMED DATA] Final transformed hackathons:', transformedHackathons);
        setApiHackathons(transformedHackathons)
      }
    } catch (err) {
      console.error('❌ [API ERROR] Failed to fetch hackathons:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch user profile (includes profile picture for face verification)
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('⚠️ [USER PROFILE] No token found')
        return
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success && data.user) {
        console.log('✅ [USER PROFILE] Fetched successfully:', data.user)
        setUserProfile(data.user)
      }
    } catch (error) {
      console.error('❌ [USER PROFILE] Failed to fetch:', error)
    }
  }

  // Check if hackathon is live based on schedule
  const isHackathonLive = (hackathon) => {
    const now = new Date()
    const startDate = new Date(hackathon.startDate || hackathon.date)
    const endDate = new Date(hackathon.endDate || hackathon.date)
    
    // Hackathon is live if current time is between start and end dates
    return now >= startDate && now <= endDate
  }

  // Handle joining online hackathon with face verification
  const handleJoinOnlineHackathon = (hackathon) => {
    console.log('🎯 [JOIN HACKATHON] button clicked for:', hackathon.title)
    
    // Check if hackathon is live
    if (!isHackathonLive(hackathon)) {
      alert('This hackathon is not live yet. Please wait until the scheduled start time.')
      return
    }

    // SKIP VERIFICATION - DIRECT ENTRY for Online Hackathons
    // As per new requirements: "Join Hackathon" -> Code Editor
    console.log('⏩ [JOIN HACKATHON] Skipping verification for online hackathon. Redirecting to Editor.')
    navigate(`/editor/${hackathon.id || hackathon._id}`)

    /* 
    // PREVIOUS VERIFICATION LOGIC COMMENTED OUT
    // Open face verification modal
    setFaceVerificationModal({
      open: true,
      hackathon: hackathon
    })
    */
  }

  // Handle successful face verification
  const handleFaceVerificationSuccess = (verificationResult) => {
    console.log('✅ [FACE VERIFICATION] Success:', verificationResult)
    
    // Capture context before closing
    const currentHackathon = faceVerificationModal.hackathon;
    const isRegistration = faceVerificationModal.isRegistration;
    const registrationData = faceVerificationModal.registrationData;

    // Close modal
    setFaceVerificationModal({ open: false, hackathon: null })

    if (isRegistration) {
      console.log('🎉 [REGISTRATION] Face verified! Showing success modal.');
      // Show success modal
      setRegistrationSuccessModal({
          open: true,
          hackathon: currentHackathon,
          registration: registrationData
      })
    } else {
      // Normal "Join" flow
      // Navigate to contest/editor page
      if (currentHackathon) {
        // Navigate to problem statements or editor
        navigate(`/editor/${currentHackathon.id || currentHackathon._id}`)
        
        // You can also show a success toast here
        console.log('🚀 [NAVIGATION] Entering hackathon:', currentHackathon.title)
      }
    }
  }

  // Handle face verification failure
  const handleFaceVerificationClose = () => {
    console.log('❌ [FACE VERIFICATION] Cancelled or failed')
    setFaceVerificationModal({ open: false, hackathon: null })
  }

  // Use only API hackathons (or fall back to static for demo if API is empty)
  const allHackathons = apiHackathons.length > 0 ? apiHackathons : availableHackathons
  
  console.log('📊 [DASHBOARD STATE] apiHackathons length:', apiHackathons.length);
  console.log('📊 [DASHBOARD STATE] Using', apiHackathons.length > 0 ? 'API' : 'STATIC', 'hackathons');
  console.log('📊 [DASHBOARD STATE] allHackathons:', allHackathons);

  const filtered = allHackathons.filter(h => {
    if(tab === 'Online' && h.mode !== 'Online' && h.mode !== 'online') return false
    if(tab === 'Near Me' && h.mode !== 'Offline' && h.mode !== 'offline') return false
    const searchText = `${h.title} ${h.college || ''}`.toLowerCase()
    if(query && !searchText.includes(query.toLowerCase())) return false
    return true
  })

  const myHackathons = allHackathons.filter(h => registeredHackathons.includes(h.id || h._id))

  async function openQr(item) {
    try {
      console.log('🔍 [QR MODAL] Opening QR for hackathon:', item)
      setQrModal({ open: true, item, qrCode: null, registration: null, loading: true })
      
      // Fetch user's registrations to find QR code
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('Please login to view QR code')
        setQrModal({ open: false, item: null, qrCode: null, registration: null, loading: false })
        return
      }
      
      const response = await axios.get(`${backendUrl}/api/registrations/my-registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        // Find registration for this hackathon
        const registration = response.data.data.find(
          reg => reg.hackathonId._id === item._id || reg.hackathonId._id === item.id
        )
        
        if (registration && registration.qrCode) {
          console.log('✅ [QR MODAL] QR code found for hackathon')
          setQrModal({ 
            open: true, 
            item, 
            qrCode: registration.qrCode, 
            registration: registration,
            loading: false 
          })
        } else {
          console.log('⚠️ [QR MODAL] No QR code found for this hackathon')
          setQrModal({ 
            open: true, 
            item, 
            qrCode: null, 
            registration: null,
            loading: false 
          })
        }
      }
    } catch (error) {
      console.error('❌ [QR MODAL] Failed to fetch QR code:', error)
      setQrModal({ 
        open: true, 
        item, 
        qrCode: null, 
        registration: null,
        loading: false 
      })
    }
  }
  
  function closeQr(){ setQrModal({ open: false, item: null, qrCode: null, registration: null, loading: false }) }

  function openResult(item){ setResultModal({ open: true, item }) }
  function closeResult(){ setResultModal({ open:false, item:null }) }

  function showDistance(hackathon) {
    console.log('🔍 [GET LOCATION DEBUG] ============ START ============');
    
    // Get student college address
    const collegeAddress = localStorage.getItem('userCollegeAddress') || localStorage.getItem('userCollege');
    console.log('📍 [STUDENT FROM] College Address from localStorage:', collegeAddress);
    console.log('📍 [STUDENT FROM] userCollegeAddress:', localStorage.getItem('userCollegeAddress'));
    console.log('📍 [STUDENT FROM] userCollege:', localStorage.getItem('userCollege'));
    
    if (!collegeAddress) {
      console.error('❌ [FAILURE] Student college address is missing!');
      return;
    }
    
    // Log complete hackathon object
    console.log('🏢 [HACKATHON] Full hackathon object:', hackathon);
    console.log('🏢 [HACKATHON] Hackathon title:', hackathon.title);
    console.log('🏢 [HACKATHON] Hackathon college:', hackathon.college);
    console.log('🏢 [HACKATHON] Hackathon location object:', hackathon.location);
    
    let destination = '';
    let destinationType = '';
    
    // Check if valid coordinates exist
    const lat = hackathon.location?.latitude;
    const lng = hackathon.location?.longitude;
    console.log('📍 [VENUE TO] Raw latitude:', lat);
    console.log('📍 [VENUE TO] Raw longitude:', lng);
    
    const hasValidCoords = lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    console.log('📍 [VENUE TO] Has valid coordinates:', hasValidCoords);
    
    if (hasValidCoords) {
      // Use coordinates (most accurate)
      destination = `${lat},${lng}`;
      destinationType = 'COORDINATES';
      console.log('✅ [VENUE TO] Using COORDINATES:', destination);
    } else if (hackathon.location?.address) {
      // Use full address
      destination = hackathon.location.address;
      if (hackathon.location.city) destination += ', ' + hackathon.location.city;
      destinationType = 'ADDRESS';
      console.log('✅ [VENUE TO] Using ADDRESS:', destination);
    } else if (hackathon.location?.venueName) {
      // Use venue name
      destination = hackathon.location.venueName;
      if (hackathon.location.city) destination += ', ' + hackathon.location.city;
      destinationType = 'VENUE_NAME';
      console.log('✅ [VENUE TO] Using VENUE_NAME:', destination);
    } else {
      console.error('❌ [FAILURE] No venue location data available!');
      console.error('❌ [FAILURE] hackathon.location is:', hackathon.location);
      return;
    }
    
    console.log('🗺️ [MAPS URL] Destination type:', destinationType);
    console.log('🗺️ [MAPS URL] FROM (origin):', collegeAddress);
    console.log('🗺️ [MAPS URL] TO (destination):', destination);
    
    // Build and open Google Maps URL
    const origin = encodeURIComponent(collegeAddress);
    const dest = encodeURIComponent(destination);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
    
    console.log('🗺️ [MAPS URL] Encoded origin:', origin);
    console.log('🗺️ [MAPS URL] Encoded destination:', dest);
    console.log('🗺️ [MAPS URL] Full Google Maps URL:', mapsUrl);
    console.log('🔍 [GET LOCATION DEBUG] ============ END ============');
    
    window.open(mapsUrl, '_blank');
  }
  
  function closeDistance(){ setDistanceModal({ open:false, hackathon:null, distance: '' }) }

  function handleRegister(hackathon){
    // Open registration modal with hackathon details
    setRegistrationModal({ open: true, hackathon })
  }

  function handleRegistrationSuccess(registration) {
    console.log('✅ [REGISTRATION SUCCESS] Registration data received:', registration);
    
    const hackathonId = registration.hackathonId
    setRegisteredHackathons(prev => {
      const next = [...prev, hackathonId]
      try{ localStorage.setItem('registeredHackathons', JSON.stringify(next)) }catch(e){}
      return next
    })

    // Find the hackathon from allHackathons
    const hackathon = allHackathons.find(h => h.id === hackathonId || h._id === hackathonId)
    
    // Show success modal with QR code (for offline) and calendar permission
    setRegistrationSuccessModal({
      open: true,
      hackathon,
      registration
    })

    // Close registration modal
    setRegistrationModal({ open: false, hackathon: null })
  }

  const handleCalendarConnect = async () => {
    try {
      const hackathon = registrationSuccessModal.hackathon
      if (!hackathon) return false

      // Get auth URL first (try new endpoint, fallback to legacy)
      let authResponse = await fetch(`${API_URL}/google-calendar/auth`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      let authData = await authResponse.json()

      if (!authData.success || !authData.authUrl) {
        authResponse = await fetch(`${API_URL}/calendar/auth-url`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        authData = await authResponse.json()
      }

      if (!authData.success || !authData.authUrl) {
        console.error('❌ [CALENDAR] Failed to get auth URL')
        return false
      }

      // Open OAuth popup
      const popup = window.open(authData.authUrl, 'Google Calendar', 'width=600,height=600')
      
      // Wait for OAuth completion (listen for message or poll)
      return new Promise((resolve) => {
        const checkInterval = setInterval(async () => {
          if (popup && popup.closed) {
            clearInterval(checkInterval)
            
            // Try to add event after auth
            const success = await addHackathonToCalendar(hackathon)
            resolve(success)
          }
        }, 1000)

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval)
          if (popup && !popup.closed) popup.close()
          resolve(false)
        }, 120000)
      })
    } catch (error) {
      console.error('❌ [CALENDAR] Connection failed:', error)
      return false
    }
  }

  const addHackathonToCalendar = async (hackathon) => {
    try {
      const startDate = new Date(hackathon.startDate || hackathon.date)
      const endDate = new Date(hackathon.endDate || hackathon.date)
      
      const eventDetails = {
        hackathonTitle: hackathon.title,
        hackathonMode: hackathon.mode,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        organizerName: hackathon.organizer || hackathon.college,
        venue: hackathon.location || null,
        platformLink: hackathon.platformLink || null
      }

      // Use new endpoint (fallback to legacy)
      let response = await fetch(`${API_URL}/google-calendar/add-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventDetails)
      })
      if (!response.ok) {
        response = await fetch(`${API_URL}/calendar/add-event`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(eventDetails)
        })
      }

      const data = await response.json()
      console.log('✅ [CALENDAR] Event creation response:', data)

      return data.success
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to add event:', error)
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* FILTER & SEARCH BAR */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              {['All Hackathons','Online','Near Me'].map(t=> (
                <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-md text-sm font-medium ${tab===t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-1/2">
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search hackathons or college" className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm" />
              <button onClick={()=>{ setQuery(''); setTab('All Hackathons') }} className="px-3 py-2 text-sm text-gray-600 border border-gray-100 rounded-md hover:bg-gray-50">Reset</button>
            </div>
          </div>
        </div>

        {/* 1) AVAILABLE HACKATHONS */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Hackathons</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hackathons available</h3>
              <p className="mt-1 text-sm text-gray-500">No hackathons available right now. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(h => (
              <article key={h.id} className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="h-48 w-full overflow-hidden rounded-t-lg">
                  <img src={h.image} alt={h.title} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://via.placeholder.com/600x400?text=Hackathon' }} />
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900">{h.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{h.college} • {new Date(h.date).toLocaleDateString()}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${h.mode==='Online' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{h.mode}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${h.status==='Active' ? 'bg-green-100 text-green-700' : h.status==='Completed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-800'}`}>{h.status}</span>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
                    {h.mode === 'Offline' && (
                      <button onClick={()=>{console.log('🔘 [BUTTON CLICK] Get Location clicked for:', h); showDistance(h);}} className="flex-1 sm:flex-auto px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md">Get Location & Distance</button>
                    )}
                    
                    {/* Dynamic Button Logic */}
                    {(() => {
                      const isRegistered = registeredHackathons.includes(h.id || h._id)
                      const status = (h.status || '').toLowerCase()
                      const isOnline = (h.mode || '').toLowerCase() === 'online'

                      if (status === 'completed') {
                        return <div className="flex-1 sm:flex-auto px-3 py-2 text-sm text-gray-500 font-medium text-center bg-gray-100 rounded-md">Completed</div>
                      }
                      
                      if (status === 'active' || status === 'ongoing') {
                        if (isRegistered) {
                          return (
                            <button 
                              onClick={() => isOnline ? handleJoinOnlineHackathon(h) : openQr(h)} 
                              className="flex-1 sm:flex-auto px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md animate-pulse font-semibold"
                            >
                              {isOnline ? 'Join Hackathon' : 'View Ticket'}
                            </button>
                          )
                        } else {
                          return (
                            <div className="flex-1 sm:flex-auto px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md border border-gray-200 text-center cursor-not-allowed">
                              Hackathon is live. Registration is closed.
                            </div>
                          )
                        }
                      }

                      // Scheduled / Upcoming / Default
                      if (isRegistered) {
                        return <button disabled className="flex-1 sm:flex-auto px-3 py-2 text-sm bg-gray-100 text-gray-500 rounded-md cursor-not-allowed">✔ Registered</button>
                      } else {
                        return <button onClick={() => handleRegister(h)} className="flex-1 sm:flex-auto px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">Register</button>
                      }
                    })()}
                  </div>
                </div>
              </article>
            ))}
            </div>
          )}
        </section>

        {/* 2) MY HACKATHONS */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Hackathons</h2>
          {myHackathons.length === 0 ? (
            <p className="text-sm text-gray-500">You have not registered for any hackathons yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHackathons.map(h => (
                <article key={h.id} className="bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900">{h.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{h.mode} • {h.status === 'Active' ? 'Active' : h.status}</p>
                  </div>

                  <div className="px-4 pb-4 pt-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {h.mode === 'Online' || h.mode === 'online' ? (
                        // Online hackathon - show Join button if live
                        isHackathonLive(h) && (h.status === 'Active' || h.status === 'ongoing') ? (
                          <button 
                            onClick={() => handleJoinOnlineHackathon(h)} 
                            className="w-full sm:w-auto px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 shadow-sm"
                          >
                            <span className="animate-pulse">🔴</span>
                            <span>Join Hackathon (LIVE)</span>
                          </button>
                        ) : (
                          // Show "Not Live Yet" only if NOT completed
                          h.status !== 'Completed' && (
                            <div className="w-full sm:w-auto px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md text-center">
                              ⏰ Not Live Yet
                            </div>
                          )
                        )
                      ) : (
                        // Offline hackathon - show QR code and location
                        <>
                          <button onClick={()=>openQr(h)} className="w-full sm:w-auto px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-md">View QR Code</button>
                          <button onClick={()=>{console.log('🔘 [BUTTON CLICK] Get Location clicked for:', h); showDistance(h);}} className="w-full sm:w-auto px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-md">Get Location & Distance</button>
                        </>
                      )}
                      {h.status === 'Completed' && (
                        <button onClick={()=>openResult(h)} className="w-full sm:w-auto px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-md">View Result</button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 3) NOTIFICATIONS */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <ul className="space-y-3">
            {notifications.map(n => (
              <li key={n.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-md">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">i</div>
                <div className="text-sm text-gray-700">{n.text}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* 4) RESULTS & CERTIFICATES */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Results & Certificates</h2>
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div>
                  <div className="text-sm font-medium text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-500">Rank: {r.rank > 0 ? r.rank : '—'} • Score: {r.score > 0 ? r.score : '—'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-green-700">Certificate: {r.certificate}</div>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">Download</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* QR Code Modal - Shows QR with Download & Print buttons */}
      <QRCodeModal
        open={qrModal.open}
        hackathon={qrModal.item}
        qrCode={qrModal.qrCode}
        registration={qrModal.registration}
        onClose={closeQr}
      />

      {/* Face Verification Modal - For online hackathon attendance */}
      {faceVerificationModal.open && (
        <FaceVerificationModal
          open={faceVerificationModal.open}
          hackathon={faceVerificationModal.hackathon}
          userProfileImage={
            (() => {
              const img = userProfile?.liveSelfie || userProfile?.profilePicture;
              if (!img) return null;
              if (img.startsWith('http')) return img;
              return `http://localhost:5000${img}`;
            })()
          }
          onClose={handleFaceVerificationClose}
          onSuccess={handleFaceVerificationSuccess}
        />
      )}

      {/* Selfie Verifier (demo - old implementation) */}
      {verifier.open && (
        <SelfieVerifier
          open={verifier.open}
          registeredSelfie={localStorage.getItem('registeredSelfie')}
          onClose={()=>setVerifier({ open:false, hackathon:null })}
          onSuccess={()=>{
            setVerifier({ open:false, hackathon:null })
            // navigate to editor page (demo)
            navigate(`/editor/${verifier.hackathon.id}`)
          }}
          onFailure={()=>{
            setVerifier({ open:false, hackathon:null })
            alert('Face verification failed. You cannot enter the hackathon.')
          }}
        />
      )}

      {/* Result Modal */}
      {resultModal.open && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Result</h3>
              <button onClick={closeResult} className="text-gray-500">Close</button>
            </div>
            <div className="mb-2 text-sm text-gray-700">Hackathon: {resultModal.item?.title}</div>
            <div className="mb-4 text-sm text-gray-700">Rank: 8</div>
            <div className="mb-4 text-sm text-gray-700">Score: 72</div>
            <button onClick={()=>alert('Download Certificate (demo)')} className="w-full py-2 bg-blue-600 text-white rounded-md">Download Certificate</button>
          </div>
        </div>
      )}

      {/* Distance Modal (static/demo) */}
      {/* Distance Modal - Removed, now opens Google Maps directly */}

      {/* Registration Success Modal - with Calendar Integration */}
      {registrationSuccessModal.open && registrationSuccessModal.hackathon && (
        <RegistrationSuccessModal
          open={registrationSuccessModal.open}
          hackathon={registrationSuccessModal.hackathon}
          registration={registrationSuccessModal.registration}
          onClose={() => {
            setRegistrationSuccessModal({ open: false, hackathon: null, registration: null })
            navigate('/dashboard/student', { replace: true })
          }}
          onCalendarConnect={handleCalendarConnect}
        />
      )}

      {/* Team Registration Modal */}
      {registrationModal.open && registrationModal.hackathon && (
        <TeamRegistrationModal
          hackathon={registrationModal.hackathon}
          onClose={() => setRegistrationModal({ open: false, hackathon: null })}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {/* QR Code Display Modal - for offline hackathons */}
      {qrDisplayModal.open && qrDisplayModal.hackathon && qrDisplayModal.registration && (
        <QRCodeDisplay
          hackathon={qrDisplayModal.hackathon}
          registration={qrDisplayModal.registration}
          onClose={() => setQrDisplayModal({ open: false, hackathon: null, registration: null })}
        />
      )}
    </div>
  )
}

// Handler functions placed after component return would be unreachable; define before return

