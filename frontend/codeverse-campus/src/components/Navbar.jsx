import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar(){
  const location = useLocation();
  const isLanding = location.pathname === '/' || location.pathname === '/home';

  // Render header ONLY on landing page
  if (!isLanding) return null;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-6 h-6">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                {/* laptop base */}
                <rect x="6" y="14" width="52" height="34" rx="3" fill="url(#g1)" opacity="0.06" />
                <rect x="10" y="18" width="44" height="24" rx="2" fill="white" />
                {/* code brackets on screen */}
                <path d="M22 30c-1.2 0-2-1.2-2-2s.8-2 2-2" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M42 26c1.2 0 2 1.2 2 2s-.8 2-2 2" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {/* slash in middle */}
                <path d="M30 24l4 8" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
                {/* small spark to suggest innovation */}
                <g transform="translate(46,12)">
                  <circle cx="0" cy="0" r="1.8" fill="#f97316" />
                  <path d="M0-4 L0 4 M-4 0 L4 0" stroke="#f59e0b" strokeWidth="0.6" strokeLinecap="round" />
                </g>
              </svg>
            </div>
            <div className="text-lg font-extrabold text-gray-900">CodeVerse <span className="text-indigo-600 font-semibold">Campus</span></div>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium rounded-md text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
