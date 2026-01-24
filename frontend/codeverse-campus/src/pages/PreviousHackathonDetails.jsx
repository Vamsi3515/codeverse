import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PreviousHackathonDetails(){
  const navigate = useNavigate()

  // Static data for the completed hackathon
  const data = {
    title: 'Campus Hackathon 2025',
    status: 'Completed',
    mode: 'Onsite',
    date: 'Dec 10, 2025',
    description: 'Campus Hackathon 2025 was a 48-hour intensive event focused on student innovation across web, mobile and AI domains. Teams built prototypes and pitched to industry judges.',
    organizedBy: 'Silicon University',
    location: 'Main Auditorium, Silicon University Campus',
    duration: 'Dec 10, 2025 – Dec 12, 2025',
    totalParticipants: 120,
    teams: 30,
    teamSize: 'Team of 2–4',
    registration: 'Free',
    rounds: 3,
    roundTypes: ['Idea Pitch', 'Coding', 'Final Submission'],
    evaluation: 'Submissions judged on originality, technical complexity, usability and pitch quality.',
    antiCheat: 'Yes',
    winners: [
      {place: '1st', team: 'Team Aurora', members: ['Alice Kumar', 'Rohit Singh']},
      {place: '2nd', team: 'ByteBusters', members: ['Meera Patel', 'Sameer Khan']},
      {place: '3rd', team: 'GreenLoop', members: ['Anil Joshi', 'Priya Sharma']}
    ],
    certificatesIssued: 'Yes',
    resultsPublished: 'Dec 20, 2025'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">{data.status}</span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm">{data.mode}</span>
            <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-sm">{data.date}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-sm text-slate-700 mb-3">{data.description}</p>
            <div className="text-sm text-slate-600 space-y-1">
              <div><strong>Organized by:</strong> {data.organizedBy}</div>
              <div><strong>Location:</strong> {data.location}</div>
              <div><strong>Duration:</strong> {data.duration}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Participation Details</h2>
            <div className="text-sm text-slate-700 space-y-2">
              <div><strong>Total Participants:</strong> {data.totalParticipants}</div>
              <div><strong>Number of Teams:</strong> {data.teams}</div>
              <div><strong>Team Size:</strong> {data.teamSize}</div>
              <div><strong>Registration:</strong> {data.registration}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">Rounds & Evaluation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-700"><strong>Number of rounds:</strong> {data.rounds}</div>
                <div className="text-sm text-slate-700 mt-2"><strong>Round types:</strong>
                  <ul className="list-disc list-inside mt-1 text-slate-600">
                    {data.roundTypes.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-700"><strong>Evaluation criteria:</strong>
                  <div className="mt-1 text-slate-600">{data.evaluation}</div>
                </div>
                <div className="text-sm text-slate-700 mt-3"><strong>Anti-cheating enabled:</strong> {data.antiCheat}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.winners.map((w, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-slate-600">{w.place}</div>
                  <div className="font-medium text-slate-800 mt-1">{w.team}</div>
                  <div className="text-sm text-slate-600 mt-1">{w.members.join(', ')}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-slate-600">
              <div><strong>Certificates issued:</strong> {data.certificatesIssued}</div>
              <div><strong>Results published:</strong> {data.resultsPublished}</div>
            </div>
          </div>

        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button disabled className="px-4 py-2 bg-slate-200 text-slate-500 rounded-md">View Results</button>
          <button disabled className="px-4 py-2 bg-slate-200 text-slate-500 rounded-md">Download Certificates</button>
          <button onClick={() => navigate('/dashboard/organizer')} className="px-4 py-2 bg-sky-600 text-white rounded-md">Back to Dashboard</button>
        </div>

      </div>
    </div>
  )
}
