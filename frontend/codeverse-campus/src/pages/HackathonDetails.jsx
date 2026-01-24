import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function HackathonDetails(){
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-sm text-sky-600 mb-4">← Back</button>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold">Hackathon Details</h2>
        <p className="text-slate-600 mt-2">Static details view for hackathon <strong>{id}</strong>. Read-only placeholder.</p>
        <div className="mt-4">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80" alt="cover" className="w-full h-56 object-cover rounded-md" />
        </div>
      </div>
    </div>
  )
}
