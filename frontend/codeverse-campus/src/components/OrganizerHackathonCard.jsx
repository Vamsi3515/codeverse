import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'

export default function OrganizerHackathonCard({
  id,
  title,
  status,
  type,
  date,
  participants,
  registrations,
  imageUrl = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80',
  creatorLabel,
  createdByRole,
  onDelete,
}){
  const navigate = useNavigate()
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDeleteClick = () => {
    setShowConfirmDelete(true)
    setError('')
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ No token found in localStorage')
        setError('Authentication required')
        return
      }

      console.log('\n🗑️ DELETE HACKATHON REQUEST')
      console.log('   Hackathon ID:', id)
      console.log('   Token exists:', !!token)
      console.log('   Token length:', token.length)
      console.log('   Endpoint:', `${API_URL}/hackathons/${id}`)
      
      const response = await fetch(`${API_URL}/hackathons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('   Response status:', response.status)
      console.log('   Response ok:', response.ok)

      const data = await response.json()
      console.log('   Response data:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete hackathon')
      }

      console.log('✅ Hackathon deleted successfully')
      
      // Notify parent component to update state
      if (onDelete) {
        onDelete(id)
      }

      setShowConfirmDelete(false)
    } catch (err) {
      console.error('❌ Error deleting hackathon:', err)
      setError(err.message || 'Failed to delete hackathon')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmDelete(false)
    setError('')
  }

  const getStatusColor = () => {
    switch(status) {
      case 'Active':
      case 'Live':
        return 'bg-green-100 text-green-800'
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canDelete = status === 'Scheduled' || status === 'scheduled'

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm flex flex-col hover:shadow-md transition-shadow">
        <div className="h-40 w-full overflow-hidden rounded-t-xl">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-t-xl" />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <div className="text-sm text-slate-600 mt-1">{date}</div>
            </div>

            <div className="flex flex-col items-end text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {status}
              </span>
              <span className="mt-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{type}</span>
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-600 flex-1">
            {creatorLabel && createdByRole === 'STUDENT_COORDINATOR' && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                  {creatorLabel}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            <div>Participants: <span className="font-medium text-slate-700">{participants ?? 0}</span></div>
            <div className="text-xs text-slate-500 mt-1">Registered: <span className="font-medium text-slate-700">{registrations ?? 0}</span></div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button 
                onClick={() => navigate(`/hackathon/${id}/registrations`)} 
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                View Registrations
              </button>
              <button 
                onClick={() => navigate(`/hackathon/${id}/manage`)} 
                className="flex-1 px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700 transition-colors"
              >
                Manage
              </button>
              {canDelete && (
                <button 
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Hackathon?</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={handleCancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
