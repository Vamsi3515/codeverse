import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import OrganizerHackathonCard from '../components/OrganizerHackathonCard'
import { useAuth } from '../context/AuthContext'

const API_URL = 'http://localhost:5000/api'

// Organizer Dashboard with real backend integration and role-based access
export default function OrganizerDashboard(){
  const navigate = useNavigate()
  const { logout, userName, userRole, isLoggedIn } = useAuth()
  const [previousHackathons, setPreviousHackathons] = useState([])
  const [activeHackathons, setActiveHackathons] = useState([])
  const [scheduledHackathons, setScheduledHackathons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canCreateHackathon, setCanCreateHackathon] = useState(false)
  const [deleteToast, setDeleteToast] = useState('')

  // ✅ SECURITY: Verify user is authenticated and has correct role
  if (!isLoggedIn || userRole !== 'organizer') {
    console.error('❌ SECURITY VIOLATION: Unauthorized access attempt to Organizer Dashboard');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-6">You are not authorized to access this page. Please log in with an organizer account.</p>
          <button
            onClick={() => navigate('/login/organizer')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In as Organizer
          </button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Check if user can create hackathons
    const allowedRoles = ['organizer', 'ORGANIZER', 'STUDENT_COORDINATOR']
    setCanCreateHackathon(allowedRoles.includes(userRole))
    
    fetchOrganizerHackathons()
  }, [])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (deleteToast) {
      const timer = setTimeout(() => setDeleteToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [deleteToast])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (deleteToast) {
      const timer = setTimeout(() => setDeleteToast(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [deleteToast])

  const fetchOrganizerHackathons = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login/organizer')
        return
      }

      const response = await fetch(`${API_URL}/hackathons/organizer/my-hackathons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success) {
        const hackathons = data.hackathons || []
        
        // Categorize hackathons based on dates and status
        const now = new Date()
        const completed = []
        const active = []
        const scheduled = []

        hackathons.forEach(h => {
          const startDate = new Date(h.startDate)
          const endDate = new Date(h.endDate)

          // Status logic as per requirements
          if (now > endDate || h.status === 'completed') {
            // Completed: current time > endDateTime
            completed.push(formatHackathon(h, 'Completed'))
          } else if (now >= startDate && now <= endDate) {
            // Active: current time between start & end
            active.push(formatHackathon(h, 'Active'))
          } else if (now < startDate) {
            // Scheduled: current time < startDateTime
            scheduled.push(formatHackathon(h, 'Scheduled'))
          }
        })
        
        setPreviousHackathons(completed)
        setActiveHackathons(active)
        setScheduledHackathons(scheduled)
      } else {
        setError(data.message || 'Failed to fetch hackathons')
      }
    } catch (err) {
      console.error('Error fetching hackathons:', err)
      setError('Failed to load hackathons. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatHackathon = (h, displayStatus) => {
    // Determine creator label
    let creatorLabel = ''
    if (h.createdByRole === 'STUDENT_COORDINATOR') {
      creatorLabel = 'Created by Student Coordinator'
    } else if (h.createdBy && h.createdBy.firstName) {
      creatorLabel = `Created by ${h.createdBy.firstName} ${h.createdBy.lastName}`
    }

    return {
      id: h._id,
      title: h.title,
      type: h.mode === 'online' ? 'Online' : h.mode === 'offline' ? 'Offline' : 'Hybrid',
      date: new Date(h.startDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      participants: h.participantCount || 0,
      registrations: h.registeredCount || 0,
      imageUrl: (() => {
        const bannerImg = h.bannerImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80';
        // Convert relative paths to full URLs
        if (bannerImg.startsWith('/uploads/')) {
          return `http://localhost:5000${bannerImg}`;
        }
        return bannerImg;
      })(),
      status: displayStatus,
      creatorLabel: creatorLabel,
      createdByRole: h.createdByRole,
      _debugBannerImage: (console.log(`🖼️ FRONTEND Dashboard: Hackathon "${h.title}" bannerImage:`, h.bannerImage), null)
    }
  }

  const handleHackathonDelete = (hackathonId) => {
    console.log('🗑️  Deleting hackathon from UI:', hackathonId)
    
    // Remove from scheduled
    setScheduledHackathons(prev => {
      const filtered = prev.filter(h => h.id !== hackathonId)
      console.log('Updated scheduled:', filtered.length, 'items')
      return filtered
    })
    
    // Remove from active (in case it's there)
    setActiveHackathons(prev => prev.filter(h => h.id !== hackathonId))
    
    // Remove from previous (in case it's there)
    setPreviousHackathons(prev => prev.filter(h => h.id !== hackathonId))

    // Show success toast
    setDeleteToast('Hackathon deleted successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your hackathons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {deleteToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-40 animate-fade-in">
          {deleteToast}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-slate-900">
                {userRole === 'STUDENT_COORDINATOR' ? 'Student Coordinator Dashboard' : 'Organizer Dashboard'}
              </h1>
              <p className="text-slate-600 mt-1">Welcome, {userName || 'Organizer'}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {canCreateHackathon && (
                <button 
                  onClick={() => navigate('/create-hackathon')} 
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-medium transition"
                >
                  + Create Hackathon
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Previous Hackathons</h2>
          {previousHackathons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No completed hackathons yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousHackathons.map(h => (
                <OrganizerHackathonCard 
                  key={h.id} 
                  {...h} 
                  status="Completed"
                  onDelete={handleHackathonDelete}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Hackathons</h2>
          {activeHackathons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active hackathons</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeHackathons.map(h => (
                <OrganizerHackathonCard 
                  key={h.id} 
                  {...h} 
                  status="Active"
                  onDelete={handleHackathonDelete}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Scheduled Hackathons</h2>
          {scheduledHackathons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No scheduled hackathons. <button onClick={() => navigate('/create-hackathon')} className="text-sky-600 hover:underline">Create one now</button></p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledHackathons.map(h => (
                <OrganizerHackathonCard 
                  key={h.id} 
                  {...h} 
                  status="Scheduled"
                  onDelete={handleHackathonDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
