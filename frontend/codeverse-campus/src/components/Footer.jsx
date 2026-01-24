import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  const [showAbout, setShowAbout] = useState(false)
  return (
    <footer className="bg-[#f5f7f7] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-gray-900 font-semibold mb-3">CodeVerse Campus</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <button type="button" onClick={() => setShowAbout(true)} className="hover:text-indigo-600">About</button>
              </li>
              <li><Link to="#" className="hover:text-indigo-600">Careers</Link></li>
              <li><Link to="#" className="hover:text-indigo-600">Contact</Link></li>
              <li><Link to="#" className="hover:text-indigo-600">Help</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-3">Hackathons</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="#" className="hover:text-indigo-600">Browse Hackathons</Link></li>
              <li><Link to="#" className="hover:text-indigo-600">Explore Projects</Link></li>
              <li><Link to="#" className="hover:text-indigo-600">Host a Hackathon</Link></li>
              <li><Link to="#" className="hover:text-indigo-600">Hackathon Guides</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-3">Portfolio</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="#" className="hover:text-indigo-600">Your Projects</Link></li>
              <li><Link to="#" className="hover:text-indigo-600">Your Hackathons</Link></li>
              <li><Link to="#" className="hover:text-indigo-600">Settings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-semibold mb-3">Connect</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-indigo-600">
                  <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 5.92c-.66.3-1.36.5-2.09.6.75-.45 1.32-1.16 1.59-2.02-.7.42-1.47.72-2.29.88A4.13 4.13 0 0015.5 4c-2.28 0-4.12 1.85-4.12 4.13 0 .32.04.64.1.94C7.69 9.02 4.07 7.13 1.64 4.15c-.35.6-.55 1.3-.55 2.05 0 1.42.72 2.67 1.82 3.4-.63-.02-1.22-.2-1.74-.5v.05c0 1.98 1.41 3.62 3.28 3.99-.34.1-.7.16-1.07.16-.26 0-.52-.02-.77-.07.52 1.64 2.03 2.84 3.82 2.87A8.29 8.29 0 010 19.54 11.7 11.7 0 006.29 21c7.55 0 11.68-6.26 11.68-11.68v-.53c.8-.58 1.5-1.3 2.05-2.13-.74.33-1.53.55-2.36.65z"/></svg>
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-indigo-600">
                  <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.07.07 0 00-.074.037c-.212.38-.45.873-.62 1.26-2.05-.308-4.09-.308-6.1 0-.173-.39-.418-.882-.63-1.262a.066.066 0 00-.074-.037A19.736 19.736 0 003.68 4.37a.058.058 0 00-.03.021C1.68 9.08.76 13.553 1.03 17.962c.01.08.07.14.15.15a10.5 10.5 0 004.06-.847c.31-.11.32-.18.47-.39a7.3 7.3 0 01-1.33-.61c.11-.09.22-.17.33-.25 2.77 1.22 5.64 1.22 8.4 0 .11.09.22.16.33.25-.35.23-.7.47-1.05.69.15.07.28.18.44.27a9.45 9.45 0 004.06.85c.08 0 .14-.07.15-.15.3-4.41-.65-8.885-3.03-12.57a.044.044 0 00-.03-.02z"/></svg>
                  <span>Discord</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-indigo-600">
                  <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.5 9.88v-6.99h-2.2V12h2.2V9.8c0-2.17 1.3-3.37 3.28-3.37.95 0 1.95.17 1.95.17v2.15h-1.1c-1.08 0-1.42.67-1.42 1.36V12h2.42l-.39 2.89h-2.03v6.99A10 10 0 0022 12z"/></svg>
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 hover:text-indigo-600">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.036-1.852-3.036-1.853 0-2.136 1.445-2.136 2.939v5.666H9.355V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.37-1.852 3.604 0 4.269 2.372 4.269 5.456v6.287zM5.337 7.433a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.119 20.452H3.556V9h3.563v11.452z"/></svg>
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-500">© 2025 CodeVerse Campus. All rights reserved.</p>
        </div>

        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAbout(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6 z-10">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold text-gray-900">About CodeVerse Campus</h3>
                <button onClick={() => setShowAbout(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="mt-4 text-sm text-gray-700 space-y-3">
                <p>CodeVerse Campus is a multi-college hackathon platform designed to connect students, organizers, and institutions on a single centralized system.</p>
                <p>Our platform helps students discover online and offline hackathons, register easily, and participate using verified identities.</p>
                <p>Organizers can create and manage hackathons, configure rules, monitor participation, and analyze performance through dashboards.</p>
                <p>CodeVerse Campus aims to encourage innovation, collaboration, and real-world problem solving among students across colleges.</p>
              </div>

              <div className="mt-6 text-right">
                <button onClick={() => setShowAbout(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}

