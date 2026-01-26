import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Zap } from 'lucide-react'

// SignUp options page: choose Student or Organizer path
export default function SignUp(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Create an account
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to join CodeVerse Campus. Whether you're a student looking to grow or an organizer ready to inspire, we have a place for you.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          
          {/* Student Card */}
          <Link to="/signup/student" className="group">
            <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">01</div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Student
              </h2>
              <p className="text-gray-700 text-base mb-8 leading-relaxed">
                Discover amazing hackathons, connect with brilliant minds, and showcase your skills while competing for prizes.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Participate in 500+ hackathons</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Form teams and collaborate</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Build your portfolio</span>
                </li>
              </ul>
              
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform group-hover:scale-105">
                Sign Up as Student
              </button>
            </div>
          </Link>

          {/* Organizer Card */}
          <Link to="/signup/organizer" className="group">
            <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 sm:p-10 shadow-lg hover:shadow-2xl hover:border-purple-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">02</div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Organizer
              </h2>
              <p className="text-gray-700 text-base mb-8 leading-relaxed">
                Host and manage college hackathons, attract top talent, and build an innovative community on our platform.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Create and manage events</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Access real-time analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Manage registrations & teams</span>
                </li>
              </ul>
              
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform group-hover:scale-105">
                Sign Up as Organizer
              </button>
            </div>
          </Link>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
