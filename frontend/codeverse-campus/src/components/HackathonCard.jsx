import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HackathonCard({
  id,
  title,
  status,
  type,
  date,
  location,
  participants,
  registrations,
  actionLabel = 'View',
  imageUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
  creatorLabel,
  createdByRole
}){
  const navigate = useNavigate()

  const handleAction = () => {
    // Navigate to manage page for active/scheduled, details for previous
    if(actionLabel.toLowerCase().includes('manage')){
      navigate(`/hackathon/${id}/manage`)
    } else if (actionLabel.toLowerCase().includes('view')){
      // static previous-hackathon details page (frontend-only)
      navigate('/previous-hackathon-details')
    } else {
      navigate(`/hackathon/${id}/details`)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col">
      <div className="h-40 w-full overflow-hidden rounded-t-xl">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-t-xl" />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <div className="text-sm text-slate-600 mt-1">{date}</div>
          </div>

          <div className="flex flex-col items-end text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'Active' || status === 'Live' ? 'bg-green-100 text-green-800' : status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
            <span className="mt-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">{type}</span>
          </div>
        </div>

        <div className="mt-3 text-sm text-slate-600 flex-1">
          {location && <div className="mt-1">{location}</div>}
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
          Participants: <span className="font-medium text-slate-700">{participants ?? 0}</span>
          <div className="text-xs text-slate-500 mt-1">Registered Students: <span className="font-medium text-slate-700">{registrations ?? 0}</span></div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button onClick={handleAction} className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-md text-sm hover:bg-slate-50">View Details</button>
            <button onClick={handleAction} className="flex-1 px-3 py-2 bg-sky-600 text-white rounded-md text-sm hover:bg-sky-700">Register</button>
          </div>
        </div>
      </div>
    </div>
  )
}
 
