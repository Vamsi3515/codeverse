import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function OnlineEditor(){
  const { id } = useParams()
  const [language, setLanguage] = useState('Python')
  const [code, setCode] = useState('// Write your solution here')
  const [output, setOutput] = useState('')
  const [showSubmitted, setShowSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60*60) // 1 hour demo

  useEffect(()=>{
    const t = setInterval(()=>{
      setTimeLeft(s => s>0 ? s-1 : 0)
    },1000)
    return ()=>clearInterval(t)
  },[])

  function formatTime(s){
    const hh = String(Math.floor(s/3600)).padStart(2,'0')
    const mm = String(Math.floor((s%3600)/60)).padStart(2,'0')
    const ss = String(s%60).padStart(2,'0')
    return `${hh}:${mm}:${ss}`
  }

  function runCode(){
    setOutput('Running (demo)...\nSample Output:\nHello, World!')
  }

  function submitCode(){
    setShowSubmitted(true)
    setTimeout(()=>setShowSubmitted(false),2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Online Hackathon — Editor</h1>
            <p className="text-sm text-gray-500">Hackathon ID: {id} • Secure entry (demo)</p>
          </div>
          <div className="text-sm text-gray-600">Timer: <span className="font-mono">{formatTime(timeLeft)}</span></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1 bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-semibold mb-2">Problem Statement</h2>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="font-medium">Example Problem: Sum of Two Numbers</p>
              <p className="mt-2">Given two integers, print their sum.</p>
              <p className="mt-2 font-semibold">Constraints</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>Integers fit in 32-bit</li>
                <li>Time limit: demo only</li>
              </ul>
              <p className="mt-2 font-semibold">Input</p>
              <pre className="bg-gray-100 p-2 rounded text-xs">1 2</pre>
              <p className="mt-2 font-semibold">Output</p>
              <pre className="bg-gray-100 p-2 rounded text-xs">3</pre>
            </div>
          </aside>

          <main className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700">Language</label>
                <select value={language} onChange={e=>setLanguage(e.target.value)} className="border border-gray-200 rounded-md p-1 text-sm">
                  <option>Python</option>
                  <option>Java</option>
                  <option>C++</option>
                  <option>C</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={runCode} className="px-3 py-1 bg-gray-100 rounded-md text-sm">Run Code</button>
                <button onClick={submitCode} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Submit</button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-2">
              <textarea value={code} onChange={e=>setCode(e.target.value)} className="w-full h-64 font-mono text-sm p-3 border border-gray-100 rounded" />
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <h3 className="text-sm font-semibold mb-2">Output (demo)</h3>
              <pre className="bg-gray-900 text-green-200 p-3 rounded text-sm min-h-[80px]">{output || 'No output yet'}</pre>
            </div>
          </main>
        </div>

        {showSubmitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg">
              <h3 className="text-lg font-semibold">Code submitted successfully</h3>
              <p className="text-sm text-gray-600 mt-2">Your solution has been submitted (demo).</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
