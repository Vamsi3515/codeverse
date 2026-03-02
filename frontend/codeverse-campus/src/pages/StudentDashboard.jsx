import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import usePreventBackNavigation from '../hooks/usePreventBackNavigation'
import SelfieVerifier from '../components/SelfieVerifier'
import FaceVerificationModal from '../components/FaceVerificationModal'
import TeamRegistrationModal from '../components/TeamRegistrationModal'
import PaymentModal from '../components/PaymentModal'
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
    _id: 'h1',
    title: 'InnovateAI Hackathon',
    college: 'State Technical University',
    date: '2026-01-1',
    mode: 'Online',
    status: 'Upcoming',
    registered: false,
    registrationFee: 500,
    participationType: 'SOLO',
    image: 'https://i.pinimg.com/736x/7e/89/9e/7e899ec4e4580407fe330df18d2cee0b.jpg'
  },
  {
    id: 'h2',
    _id: 'h2',
    title: 'Campus CodeSprint',
    college: 'North College of Engineering',
    date: '2025-12-31',
    mode: 'Offline',
    status: 'Active',
    registered: true,
    registrationFee: 0,
    participationType: 'TEAM',
    minTeamSize: 2,
    maxTeamSize: 4,
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
    _id: 'h3',
    title: 'GreenTech Challenge',
    college: 'City University',
    date: '2025-11-25',
    mode: 'Online',
    status: 'Completed',
    registered: true,
    registrationFee: 300,
    participationType: 'SOLO',
    image: 'https://i.pinimg.com/736x/44/04/fc/4404fc4e8f85ed002a3d76b8b2c9fb59.jpg'
  },
  {
    id: 'h4',
    _id: 'h4',
    title: 'Campus Hack & Learn',
    college: 'Central College',
    date: '2026-02-05',
    mode: 'Offline',
    status: 'Upcoming',
    registered: false,
    registrationFee: 1000,
    participationType: 'TEAM',
    minTeamSize: 2,
    maxTeamSize: 5,
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
    _id: 'h5',
    title: 'UX/UI Sprint',
    college: 'Design Institute',
    date: '2026-03-22',
    mode: 'Online',
    status: 'Upcoming',
    registered: false,
    registrationFee: 0,
    participationType: 'SOLO',
    image: 'https://i.pinimg.com/736x/38/f9/13/38f913f969b14a6ca5af964cc5b3528a.jpg'
  },
  {
    id: 'h6',
    _id: 'h6',
    title: 'Fullstack Forge',
    college: 'Polytech Academy',
    date: '2025-12-23',
    mode: 'Offline',
    status: 'Active',
    registered: false,
    registrationFee: 750,
    participationType: 'TEAM',
    minTeamSize: 2,
    maxTeamSize: 4,
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
  const [registrationsLoaded, setRegistrationsLoaded] = useState(false)
  const [registrationModal, setRegistrationModal] = useState({ open: false, hackathon: null })
  const [registrationSuccessModal, setRegistrationSuccessModal] = useState({ open: false, hackathon: null, registration: null })
  const [paymentModal, setPaymentModal] = useState({ open: false, hackathon: null, registrationFee: 0, registrationType: null })
  const [apiHackathons, setApiHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [attemptedHackathons, setAttemptedHackathons] = useState([]) // Track attempted/submitted hackathons
  const navigate = useNavigate()
  const { userName, logout, isLoggedIn, userRole } = useAuth()

  // Prevent browser back button from going back to editor
  usePreventBackNavigation('/dashboard/student')

  // ✅ SECURITY: Verify user is authenticated and has correct role
  if (!isLoggedIn || userRole !== 'student') {
    console.error('❌ SECURITY VIOLATION: Unauthorized access attempt to Student Dashboard');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-6">You are not authorized to access this page. Please log in with a student account.</p>
          <button
            onClick={() => navigate('/login/student')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In as Student
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login-select')
  }

  useEffect(() => {
    console.log('🔍 [DASHBOARD INIT] ComponentDidMount - Fetching data...');
    // Fetch registered hackathons FIRST
    fetchMyRegistrations().then(() => {
      console.log('✅ [DASHBOARD INIT] Registrations loaded, now fetching hackathons...');
      // Then fetch other data
      fetchHackathons()
      fetchUserProfile()
      fetchAttemptedHackathons()
    })
  }, [])

  const fetchMyRegistrations = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('⚠️ [MY REGISTRATIONS] No token found')
        setRegistrationsLoaded(true)
        return
      }

      const response = await fetch(`${API_URL}/registrations/my-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('📦 [MY REGISTRATIONS] API Response:', data)
      
      if (data.success && Array.isArray(data.registrations)) {
        console.log('✅ [MY REGISTRATIONS] Fetched successfully:', data.registrations.length, 'registrations')
        console.log('✅ [MY REGISTRATIONS] Full data structure:', JSON.stringify(data.registrations, null, 2))
        
        // Extract hackathon IDs - hackathonId is an object, so we need hackathonId._id
        const registeredIds = data.registrations.map(reg => {
          console.log('🔍 [MY REGISTRATIONS] Processing registration:', JSON.stringify(reg))
          // hackathonId can be an object with _id or a string ID
          const hackId = typeof reg.hackathonId === 'object' 
            ? reg.hackathonId?._id 
            : reg.hackathonId
          console.log('🔍 [MY REGISTRATIONS] Extracted hackathonId:', hackId, 'Type:', typeof hackId)
          return hackId
        }).filter(id => {
          console.log('🔍 [MY REGISTRATIONS] Filtering ID:', id, 'Valid?', Boolean(id))
          return Boolean(id)
        })
        
        console.log('📋 [MY REGISTRATIONS] Final registered IDs:', registeredIds)
        setRegisteredHackathons(registeredIds)
        try{ localStorage.setItem('registeredHackathons', JSON.stringify(registeredIds)) }catch(e){}
      } else {
        console.log('⚠️ [MY REGISTRATIONS] No registrations found, error/data:', data)
        setRegisteredHackathons([])
      }
      setRegistrationsLoaded(true)
    } catch (error) {
      console.error('❌ [MY REGISTRATIONS] Failed to fetch:', error)
      setRegistrationsLoaded(true)
      // Fallback to localStorage
      try{
        const raw = localStorage.getItem('registeredHackathons')
        if(raw){
          const parsed = JSON.parse(raw)
          setRegisteredHackathons(Array.isArray(parsed) ? parsed : [])
          return
        }
      }catch(e){}
      setRegisteredHackathons([])
    }
  }

  const fetchAttemptedHackathons = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('⚠️ [ATTEMPTED] No token found')
        return
      }

      // Fetch all completed submissions (already filtered on backend)
      const response = await fetch(`${API_URL}/hackathons/my-submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('📡 [ATTEMPTED] API Response:', data)
      
      if (data.success && Array.isArray(data.submissions)) {
        // Backend now filters for completed, but let's double-check
        const attemptedIds = data.submissions
          .map(sub => {
            // Handle both object and string formats
            let id;
            if (typeof sub.hackathonId === 'object' && sub.hackathonId) {
              id = sub.hackathonId._id || sub.hackathonId.toString()
            } else {
              id = sub.hackathonId
            }
            // Convert ObjectId to string if needed
            id = id?.toString ? id.toString() : String(id)
            console.log(`📍 [ATTEMPTED] Processing submission - hackId: "${id}", status: ${sub.status}, score: ${sub.leaderboardScore}`)
            return id
          })
          .filter(Boolean)
        
        console.log('✅ [ATTEMPTED] Final attempted IDs (strings):', attemptedIds)
        setAttemptedHackathons(attemptedIds)
        try { localStorage.setItem('attemptedHackathons', JSON.stringify(attemptedIds)) } catch (e) { }
      } else {
        console.log('⚠️ [ATTEMPTED] No submissions found or invalid response:', data)
        setAttemptedHackathons([])
      }
    } catch (error) {
      console.error('❌ [ATTEMPTED] Failed to fetch:', error)
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem('attemptedHackathons')
        if (raw) {
          const parsed = JSON.parse(raw)
          setAttemptedHackathons(Array.isArray(parsed) ? parsed : [])
          console.log('📦 [ATTEMPTED] Using localStorage fallback:', parsed)
          return
        }
      } catch (e) { }
      setAttemptedHackathons([])
    }
  }

  const fetchHackathons = async () => {
    console.log('📡 [API CALL] Starting fetchHackathons...');
    try {
      const response = await fetch(`${API_URL}/hackathons/available`)
      const data = await response.json()
      console.log('📡 [API RESPONSE] Success:', data.success);
      console.log('📡 [API RESPONSE] Raw hackathons count:', data.hackathons?.length || 0);
      console.log('🔍 [API RAW DATA] Full hackathons array:', data.hackathons);
      
      if (data.success) {
        console.log('✅ [API SUCCESS] Processing', data.hackathons.length, 'hackathons...');
        
        // Transform API hackathons to match the expected format
        const transformedHackathons = data.hackathons.map((h, idx) => {
          console.log(`\n🔄 [TRANSFORM ${idx + 1}] Processing: "${h.title}" | Mode: ${h.mode}`);
          console.log(`   Raw API - registrationFee: ${h.registrationFee} (type: ${typeof h.registrationFee})`);
          console.log(`   Raw API - location:`, h.location);
          
          // Check location data
          if ((h.mode === 'offline' || h.mode === 'hybrid') && h.location) {
            console.log(`   ✅ Location data found: venue="${h.location.venueName}", lat=${h.location.latitude}, lng=${h.location.longitude}`);
          } else if ((h.mode === 'offline' || h.mode === 'hybrid') && !h.location) {
            console.warn(`   ❌ MISSING LOCATION DATA for ${h.mode} hackathon!`);
          }
          
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
            displayStatus: h.displayStatus || 'Upcoming',
            participationType: h.participationType,
            minTeamSize: h.minTeamSize,
            maxTeamSize: h.maxTeamSize,
            registeredCount: h.registeredCount,
            maxParticipants: h.maxParticipants,
            registrationFee: h.registrationFee || 0,
            image: h.bannerImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
            bannerImage: h.bannerImage || '',
            latitude: h.location?.latitude,
            longitude: h.location?.longitude,
            location: h.location // Include full location object
          };
          
          console.log(`   After transform - location:`, transformed.location);
          console.log(`   After transform - latitude: ${transformed.latitude}, longitude: ${transformed.longitude}`);
          console.log(`   After transform - registrationFee: ₹${transformed.registrationFee} (type: ${typeof transformed.registrationFee})`);
          console.log(`   After transform - participationType: ${transformed.participationType}\n`);
          return transformed;
        });
        
        console.log('✅ [TRANSFORMED DATA] Total:', transformedHackathons.length);
        console.log('🔍 [TRANSFORMED DATA] Offline/Hybrid hackathons:', transformedHackathons.filter(h => h.mode === 'Offline' || h.mode === 'Hybrid').map(h => ({ title: h.title, hasLocation: !!h.location, lat: h.location?.latitude, lng: h.location?.longitude })));
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
      console.log('🔍 [USER PROFILE] Token from localStorage:', token ? '✅ Found' : '❌ Not found')
      
      if (!token) {
        console.log('⚠️ [USER PROFILE] No token found')
        return
      }

      console.log('🔄 [USER PROFILE] Fetching from:', `${API_URL}/auth/me`)
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('📡 [USER PROFILE] Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('❌ [USER PROFILE] Response not OK:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('📄 [USER PROFILE] Error response body:', errorText)
        return
      }

      const data = await response.json()
      console.log('📦 [USER PROFILE] Full response data:', JSON.stringify(data, null, 2))
      
      if (data.success && data.user) {
        console.log('✅ [USER PROFILE] Success! User data:', data.user)
        console.log('🖼️ [USER PROFILE] liveSelfie:', data.user.liveSelfie)
        setUserProfile(data.user)
      } else if (data.user) {
        // Sometimes API returns user without success flag
        console.log('✅ [USER PROFILE] Got user data (no success flag):', data.user)
        console.log('🖼️ [USER PROFILE] liveSelfie:', data.user.liveSelfie)
        setUserProfile(data.user)
      } else {
        console.warn('⚠️ [USER PROFILE] No user data in response:', data)
      }
    } catch (error) {
      console.error('❌ [USER PROFILE] Fetch error:', error.message)
      console.error('❌ [USER PROFILE] Error stack:', error.stack)
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

    // NEW FLOW: Open face verification modal
    console.log('📸 [JOIN HACKATHON] Opening face verification modal for:', hackathon.title)
    setFaceVerificationModal({
      open: true,
      hackathon: hackathon,
      isRegistration: false
    })
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
    // Available Hackathons: Show UPCOMING (future) OR LIVE (currently running) hackathons that user is NOT registered for
    const now = new Date()
    const startDate = new Date(h.startDate)
    const endDate = new Date(h.endDate)
    
    // Show if upcoming (not started yet) OR currently running (started but not ended)
    const isUpcoming = startDate > now; // Hackathon is in the future
    const isLive = now >= startDate && now <= endDate; // Hackathon is currently running
    const isAvailable = isUpcoming || isLive; // Show both upcoming and live
    
    const isNotRegistered = !registeredHackathons.includes(h.id || h._id)
    
    console.log(`🔍 [FILTER DEBUG] ${h.title}: startDate=${h.startDate}, endDate=${h.endDate}, isUpcoming=${isUpcoming}, isLive=${isLive}, isAvailable=${isAvailable}, isNotRegistered=${isNotRegistered}`)
    
    if(!isAvailable || !isNotRegistered) return false
    
    if(tab === 'Online' && h.mode !== 'Online' && h.mode !== 'online') return false
    if(tab === 'Near Me' && h.mode !== 'Offline' && h.mode !== 'offline') return false
    const searchText = `${h.title} ${h.college || ''}`.toLowerCase()
    if(query && !searchText.includes(query.toLowerCase())) return false
    return true
  })

  console.log('═══════════════════════════════════════════════════════════')
  console.log('🎯 [FILTERED HACKATHONS] Total after filter:', filtered.length)
  filtered.forEach((h, idx) => {
    console.log(`   [${idx + 1}] ${h.title}`)
    console.log(`       - Fee: ₹${h.registrationFee} (type: ${typeof h.registrationFee})`)
    console.log(`       - Type: ${h.participationType}`)
    console.log(`       - Full object keys:`, Object.keys(h))
  })
  console.log('═══════════════════════════════════════════════════════════')

  // My Hackathons: Only registered hackathons, organized by status
  const registeredHackathonsData = allHackathons.filter(h => {
    const hackId = h.id || h._id
    const isRegistered = registeredHackathons.includes(hackId)
    console.log(`🔍 [REGISTERED DEBUG] ${h.title}: hackId=${hackId}, isRegistered=${isRegistered}, registeredHackathons=${JSON.stringify(registeredHackathons)}`)
    return isRegistered
  })
  
  // Helper function to check if hackathon is currently running (between start and end date)
  const isHackathonRunning = (h) => {
    const now = new Date();
    const startDate = new Date(h.startDate);
    const endDate = new Date(h.endDate);
    return now >= startDate && now <= endDate;
  };
  
  // Helper function to determine actual status (including real-time check)
  const getHackathonStatus = (h) => {
    const now = new Date();
    const startDate = new Date(h.startDate);
    const endDate = new Date(h.endDate);
    
    // If current time is between start and end, it's ACTIVE (running now)
    if (now >= startDate && now <= endDate) {
      return 'active';
    }
    
    // Otherwise use displayStatus from API
    return (h.displayStatus || '').toLowerCase();
  };
  
  // Use displayStatus for categorization (Upcoming, Active, Completed)
  // But also check real-time if hackathon is currently running
  const pastHackathons = registeredHackathonsData.filter(h => getHackathonStatus(h) === 'completed')
  const activeHackathons = registeredHackathonsData.filter(h => getHackathonStatus(h) === 'active')
  const upcomingHackathons = registeredHackathonsData.filter(h => getHackathonStatus(h) === 'upcoming')
  
  const myHackathons = registeredHackathonsData

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
    console.log('\n� [GET LOCATION] Getting location for:', hackathon.title);
    
    // Priority: Always use hackathon location
    if (!hackathon.location) {
      console.error('❌ No location data for this hackathon');
      alert('This offline hackathon does not have location details set. Please contact the organizer.');
      return;
    }
    
    const lat = hackathon.location.latitude;
    const lng = hackathon.location.longitude;
    const venueName = hackathon.location.venueName || 'Hackathon Venue';
    const venueAddress = hackathon.location.address || '';
    const venueCity = hackathon.location.city || '';
    
    // Validate hackathon coordinates
    const hasValidCoords = lat !== undefined && lat !== null && lng !== undefined && lng !== null && 
                          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    
    if (!hasValidCoords) {
      console.error('Invalid hackathon coordinates');
      alert('This hackathon has invalid location coordinates. Please contact the organizer.');
      return;
    }
    
    const coords = `${lat},${lng}`;
    console.log('Hackathon Venue:', venueName);
    console.log('   Coordinates:', coords);
    console.log('   Address:', venueAddress, venueCity);
    
    // Try to get student origin (optional - for routing)
    const studentLat = localStorage.getItem('userLatitude');
    const studentLng = localStorage.getItem('userLongitude');
    
    let mapsUrl = '';
    
    // If student coordinates available, create routing URL
    if (studentLat && studentLng) {
      const studentCoords = `${studentLat},${studentLng}`;
      const isValidStudentCoords = parseFloat(studentLat) >= -90 && parseFloat(studentLat) <= 90 && 
                                   parseFloat(studentLng) >= -180 && parseFloat(studentLng) <= 180;
      
      if (isValidStudentCoords) {
        // Show route from student location to hackathon - coordinates are accurate
        mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(studentCoords)}&destination=${encodeURIComponent(coords)}&travelmode=driving`;
        console.log('Opening route: Student Location → Hackathon Venue');
      } else {
        // Invalid student coords, show exact hackathon venue using coordinates directly
        mapsUrl = `https://www.google.com/maps/@${lat},${lng},17z`;
        console.log('Showing hackathon venue location with coordinates');
      }
    } else {
      // No student coordinates, show the exact hackathon location using coordinates
      // @lat,lng,17z directly pins the location on Google Maps without venue name lookup
      mapsUrl = `https://www.google.com/maps/@${lat},${lng},17z`;
      console.log('Showing hackathon venue at', coords);
    }
    
    console.log('Opening Maps URL:', mapsUrl);
    window.open(mapsUrl, '_blank');
  }
  
  function closeDistance(){ setDistanceModal({ open:false, hackathon:null, distance: '' }) }

  function handleRegister(hackathon){
    // Check hackathon participation type
    const participationType = hackathon.participationType?.toUpperCase() || 'SOLO'
    const registrationFee = hackathon.registrationFee || 0
    
    console.log('═══════════════════════════════════════════════════════════')
    console.log('📋 [REGISTER] FULL HACKATHON OBJECT:', hackathon)
    console.log('═══════════════════════════════════════════════════════════')
    console.log('📋 [REGISTER] Extracted Values:')
    console.log('   - Title:', hackathon.title)
    console.log('   - Participation Type:', participationType)
    console.log('   - Registration Fee:', registrationFee)
    console.log('   - Fee Type:', typeof registrationFee)
    console.log('   - Fee > 0?:', registrationFee > 0)
    console.log('   - Fee && Fee > 0?:', registrationFee && registrationFee > 0)
    console.log('═══════════════════════════════════════════════════════════')

    if (participationType === 'TEAM') {
      // Team registration - always open TeamRegistrationModal first
      // PaymentModal will be opened INSIDE TeamRegistrationModal if fee > 0
      console.log('🎯 [REGISTER] Opening TEAM registration modal')
      setRegistrationModal({ open: true, hackathon })
    } else {
      // Solo registration
      if (registrationFee && registrationFee > 0) {
        // Show payment modal only if there's a fee
        console.log('💳 [REGISTER] TEAM=NO, FEE>0 → Opening payment modal for solo registration with fee ₹' + registrationFee)
        setPaymentModal({
          open: true,
          hackathon,
          registrationFee,
          registrationType: 'SOLO'
        })
      } else {
        // Direct registration if no fee
        console.log('✅ [REGISTER] TEAM=NO, FEE=0 → Registering directly without payment (fee=' + registrationFee + ')')
        registerSoloDirectly(hackathon)
      }
    }
  }

  const registerSoloDirectly = async (hackathon) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to register')
        return
      }

      const response = await fetch(`${API_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hackathonId: hackathon._id
        })
      })

      const data = await response.json()
      console.log('📦 [REGISTER] Response status:', response.status, 'Data:', data)

      if (data.success) {
        handleRegistrationSuccess(data.registration)
      } else if (response.status === 400 && data.message && data.message.toLowerCase().includes('already registered')) {
        // User is already registered - refetch from backend to sync
        console.log('⚠️ [REGISTER] Already registered, syncing with backend...')
        await fetchMyRegistrations()
        alert('You are already registered for ' + hackathon.title + '. Check "My Hackathons" tab.')
      } else {
        alert(data.message || 'Registration failed')
      }
    } catch (err) {
      console.error('Registration error:', err)
      alert('Failed to register. Please try again.')
    }
  }

  function handleRegistrationSuccess(registration) {
    console.log('✅ [REGISTRATION SUCCESS] Registration data received:', registration);
    console.log('🎫 [REGISTRATION SUCCESS] QR Code present?', !!registration?.qrCode);
    if (registration?.qrCode) {
      console.log('🎫 [REGISTRATION SUCCESS] QR Code length:', registration.qrCode.length, 'characters');
    }
    
    // Extract hackathonId properly (could be string or object)
    const hackathonId = typeof registration.hackathonId === 'object' 
      ? registration.hackathonId?._id 
      : registration.hackathonId
    
    console.log('✅ [REGISTRATION SUCCESS] Extracted hackathonId:', hackathonId);
    
    // Update local state immediately for instant UI update
    setRegisteredHackathons(prev => {
      const next = [...prev, hackathonId]
      try{ localStorage.setItem('registeredHackathons', JSON.stringify(next)) }catch(e){}
      return next
    })

    // Refetch registrations from backend to ensure data consistency
    fetchMyRegistrations()

    // Find the hackathon from allHackathons
    const hackathon = allHackathons.find(h => h.id === hackathonId || h._id === hackathonId)
    
    console.log('📋 [REGISTRATION SUCCESS] Hackathon found:', hackathon?.title, 'Mode:', hackathon?.mode);
    
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
      if (!hackathon) {
        console.error('❌ [CALENDAR] No hackathon found')
        return false
      }

      console.log('📅 [CALENDAR] Starting calendar connection for:', hackathon.title)

      // Get auth URL from backend
      const authResponse = await fetch(`${API_URL}/calendar/auth-url`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const authData = await authResponse.json()

      if (!authData.success || !authData.authUrl) {
        console.error('❌ [CALENDAR] Failed to get auth URL:', authData)
        alert('Failed to connect Google Calendar. Please try again.')
        return false
      }

      console.log('✅ [CALENDAR] Auth URL obtained, opening OAuth popup...')

      // Open OAuth popup
      const popup = window.open(authData.authUrl, 'Google Calendar', 'width=700,height=600')
      
      if (!popup) {
        alert('Please allow popups to connect Google Calendar')
        return false
      }

      // Wait for OAuth completion using postMessage
      return new Promise((resolve) => {
        const messageHandler = async (event) => {
          // Security: only accept messages from same origin
          if (event.origin !== window.location.origin) return

          const { type, accessToken, refreshToken, error } = event.data

          if (type === 'CALENDAR_AUTH_SUCCESS') {
            console.log('✅ [CALENDAR] OAuth success, received tokens')
            window.removeEventListener('message', messageHandler)
            
            // Add event to calendar
            const success = await addHackathonToCalendar(hackathon)
            resolve(success)
          } else if (type === 'CALENDAR_AUTH_FAILED') {
            console.error('❌ [CALENDAR] OAuth failed:', error)
            window.removeEventListener('message', messageHandler)
            alert(`Calendar connection failed: ${error}`)
            resolve(false)
          }
        }

        window.addEventListener('message', messageHandler)

        // Timeout after 3 minutes
        setTimeout(() => {
          window.removeEventListener('message', messageHandler)
          if (popup && !popup.closed) {
            popup.close()
          }
          console.warn('⚠️ [CALENDAR] OAuth connection timeout')
          resolve(false)
        }, 180000)
      })
    } catch (error) {
      console.error('❌ [CALENDAR] Connection failed:', error)
      alert('Error connecting to Google Calendar. Please try again.')
      return false
    }
  }

  const addHackathonToCalendar = async (hackathon) => {
    try {
      console.log('📝 [CALENDAR] Creating calendar event for:', hackathon.title)
      
      const startDate = new Date(hackathon.startDate || hackathon.date)
      const endDate = new Date(hackathon.endDate || new Date(startDate.getTime() + 24 * 60 * 60 * 1000))
      
      const eventDetails = {
        hackathonId: hackathon._id || hackathon.id,
        hackathonTitle: hackathon.title,
        hackathonMode: hackathon.mode,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        organizerName: hackathon.organizer || hackathon.college || 'Organizer',
        venue: hackathon.location ? `${hackathon.location.venueName}, ${hackathon.location.city}` : null
      }

      console.log('📤 [CALENDAR] Sending event creation request:', eventDetails)

      const response = await fetch(`${API_URL}/calendar/add-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventDetails)
      })

      const data = await response.json()
      console.log('📨 [CALENDAR] Event creation response:', data)

      if (!data.success) {
        console.error('❌ [CALENDAR] Failed to create event:', data.message)
        if (data.error === 'NO_GOOGLE_TOKEN') {
          alert('Please complete the Google Calendar authentication.')
        } else {
          alert(data.message || 'Failed to add event to calendar')
        }
        return false
      }

      console.log('✅ [CALENDAR] Event created successfully:', data.eventId)
      console.log('📋 [CALENDAR] Event link:', data.eventLink)
      
      return true
    } catch (error) {
      console.error('❌ [CALENDAR] Failed to add event:', error)
      alert('Failed to add hackathon to calendar. Please try again.')
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* WELCOME HEADER WITH LOGOUT */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard/student')}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition font-semibold text-sm"
                title="Go to home (Student Dashboard)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome, {userProfile?.firstName || userName || 'Student'}!</h1>
                <p className="text-blue-100 mt-1 text-sm">Ready to explore amazing hackathons?</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-50 transition shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>

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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Hackathons</h2>
            <button 
              onClick={() => {
                setLoading(true)
                fetchHackathons()
              }}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition"
            >
              ↻ Refresh
            </button>
          </div>
          
          {!registrationsLoaded ? (
            <div className="flex items-center justify-center py-12">
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-2">Loading your registrations...</p>
              </div>
            </div>
          ) : loading ? (
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
                  <p className="text-xs text-gray-500 mt-1">
                    {h.mode === 'Offline' && h.location?.venueName ? (
                      <>
                        <span className="font-semibold text-orange-600">📍 {h.location.venueName}</span>
                        <span className="text-orange-500">*</span>
                      </>
                    ) : (
                      h.college
                    )}
                    {' '} • {new Date(h.date).toLocaleDateString()}
                  </p>
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
                      const hackId = String(h.id || h._id)
                      const isAttempted = attemptedHackathons.some(id => String(id) === hackId)
                      
                      console.log(`🔘 [BUTTON LOGIC] ${h.title}:`, {
                        hackId,
                        isRegistered,
                        isAttempted,
                        attemptedHackathons: attemptedHackathons.map(String),
                        match: attemptedHackathons.some(id => String(id) === hackId)
                      })

                      if (status === 'completed') {
                        return <div className="flex-1 sm:flex-auto px-3 py-2 text-sm text-gray-500 font-medium text-center bg-gray-100 rounded-md">Completed</div>
                      }
                      
                      if (status === 'active' || status === 'ongoing') {
                        if (isRegistered) {
                          // If attempted, show "Attempted" badge with Leaderboard button
                          if (isAttempted) {
                            return (
                              <div className="flex gap-2 flex-1 sm:flex-auto">
                                <div className="flex-1 px-3 py-2 text-sm font-semibold text-center bg-gradient-to-r from-slate-100 to-slate-200 rounded-md cursor-not-allowed border-2 border-slate-300 shadow-sm" title="You have already attempted this hackathon">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full text-xs font-bold">✔</span>
                                    <span className="text-slate-700">Attempted</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => navigate(`/hackathons/${h.id || h._id}/leaderboard`)}
                                  className="flex-1 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold"
                                >
                                  See Leaderboard
                                </button>
                              </div>
                            )
                          }
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
            <div className="space-y-8">
              {/* UPCOMING HACKATHONS */}
              {upcomingHackathons.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Upcoming</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingHackathons.map(h => (
                      <article key={h.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                        {/* Banner Image */}
                        <div className="h-40 w-full overflow-hidden bg-gray-100">
                          <img 
                            src={h.bannerImage ? (h.bannerImage.startsWith('/uploads/') ? `http://localhost:5000${h.bannerImage}` : h.bannerImage) : 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80'}
                            alt={h.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-lg font-semibold text-gray-900">{h.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{new Date(h.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500 mt-2">{h.mode} • {h.participationType?.toUpperCase() || 'SOLO'}</p>
                          
                          {/* Buttons */}
                          <div className="mt-4 flex gap-2">
                            {h.mode === 'Offline' && (
                              <button onClick={()=>{console.log('🔘 [BUTTON CLICK] Get Location clicked for:', h); showDistance(h);}} className="flex-1 px-3 py-2 text-xs bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition font-medium">Get Location</button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVE HACKATHONS */}
              {activeHackathons.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-green-200">Active</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeHackathons.map(h => (
                      <article key={h.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col border-l-4 border-green-500">
                        {/* Banner Image */}
                        <div className="h-40 w-full overflow-hidden bg-gray-100">
                          <img 
                            src={h.bannerImage ? (h.bannerImage.startsWith('/uploads/') ? `http://localhost:5000${h.bannerImage}` : h.bannerImage) : 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80'}
                            alt={h.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{h.title}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">🔴 Live</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{new Date(h.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500 mt-2">{h.mode} • {h.participationType?.toUpperCase() || 'SOLO'}</p>
                          
                          {/* Buttons */}
                          <div className="mt-4 flex gap-2 flex-wrap">
                            {h.mode === 'Online' || h.mode === 'online' ? (
                              isHackathonLive(h) ? (
                                (() => {
                                  const hackId = String(h.id || h._id)
                                  const isAttempted = attemptedHackathons.some(id => String(id) === hackId)
                                  console.log(`🔘 [ACTIVE BUTTON] ${h.title}: hackId=${hackId}, isAttempted=${isAttempted}, attemptedIds=${attemptedHackathons}`)
                                  
                                  if (isAttempted) {
                                    return (
                                      <div className="flex gap-2 flex-1">
                                        <div className="flex-1 px-3 py-2 text-xs font-semibold text-center bg-gradient-to-r from-slate-100 to-slate-200 rounded-md border-2 border-slate-300 shadow-sm" title="You have already attempted this hackathon">
                                          <div className="flex items-center justify-center gap-2">
                                            <span className="inline-flex items-center justify-center w-4 h-4 bg-green-500 text-white rounded-full text-xs font-bold">✔</span>
                                            <span className="text-slate-700 text-xs">Attempted</span>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => navigate(`/hackathons/${hackId}/leaderboard`)}
                                          className="flex-1 px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold"
                                        >
                                          Leaderboard
                                        </button>
                                      </div>
                                    )
                                  }
                                  
                                  return (
                                    <button 
                                      onClick={() => handleJoinOnlineHackathon(h)} 
                                      className="flex-1 px-3 py-2 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-md transition"
                                    >
                                      Join Now
                                    </button>
                                  )
                                })()
                              ) : (
                                <div className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-md text-center">Not Live Yet</div>
                              )
                            ) : (
                              <>
                                <button onClick={()=>openQr(h)} className="flex-1 px-3 py-2 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition font-medium">QR Code</button>
                                <button onClick={()=>{console.log('🔘 [BUTTON CLICK] Get Location clicked for:', h); showDistance(h);}} className="flex-1 px-3 py-2 text-xs bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition font-medium">Location</button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* PAST HACKATHONS */}
              {pastHackathons.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">Past</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastHackathons.map(h => (
                      <article key={h.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col opacity-85">
                        {/* Banner Image */}
                        <div className="h-40 w-full overflow-hidden bg-gray-200">
                          <img 
                            src={h.bannerImage ? (h.bannerImage.startsWith('/uploads/') ? `http://localhost:5000${h.bannerImage}` : h.bannerImage) : 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80'}
                            alt={h.title}
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-lg font-semibold text-gray-900">{h.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{new Date(h.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500 mt-2">{h.mode} • Completed</p>
                          
                          {/* Button */}
                          <div className="mt-4">
                            <button onClick={()=>openResult(h)} className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition font-medium">View Result</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
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
              console.log('🔍 [PROFILE IMAGE DEBUG] Entire userProfile object:', userProfile)
              // Use liveSelfie field as it's stored in MongoDB
              const img = userProfile?.liveSelfie;
              console.log('🖼️ [PROFILE IMAGE] liveSelfie:', userProfile?.liveSelfie, 'selected:', img)
              if (!img) {
                console.warn('⚠️ [PROFILE IMAGE] No liveSelfie found in userProfile!')
                return null;
              }
              const fullUrl = img.startsWith('http') ? img : `http://localhost:5000${img}`;
              console.log('✅ [PROFILE IMAGE] Using URL:', fullUrl)
              return fullUrl;
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

      {/* Payment Modal - For hackathon registration with fees */}
      {paymentModal.open && (
        <PaymentModal
          open={paymentModal.open}
          hackathon={paymentModal.hackathon}
          registrationType={paymentModal.registrationType}
          registrationFee={paymentModal.registrationFee}
          teamData={paymentModal.teamData}
          onClose={() => setPaymentModal({ open: false, hackathon: null, registrationFee: 0, registrationType: null })}
          onPaymentSuccess={handleRegistrationSuccess}
          onPaymentFailed={(error) => {
            setPaymentModal({ open: false, hackathon: null, registrationFee: 0, registrationType: null })
          }}
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

