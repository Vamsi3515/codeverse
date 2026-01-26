import React from 'react'
import { Link } from 'react-router-dom'
import { LogIn, GraduationCap, Briefcase, ArrowRight } from 'lucide-react'

export default function LoginSelect(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sign in to your account and continue your journey with CodeVerse Campus
          </p>
        </div>

        {/* Login Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
          
          {/* Student Login Card */}
          <Link to="/login/student" className="group">
            <div className="h-full bg-white rounded-2xl p-8 sm:p-10 border-2 border-gray-200 shadow-lg hover:shadow-2xl hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Student Login
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in as a student to explore hackathons, register for events, and showcase your projects.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Browse & participate in hackathons</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Build and manage teams</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Track your registration status</span>
                </div>
              </div>
              
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:gap-3">
                Sign In as Student
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </Link>

          {/* Organizer Login Card */}
          <Link to="/login/organizer" className="group">
            <div className="h-full bg-white rounded-2xl p-8 sm:p-10 border-2 border-gray-200 shadow-lg hover:shadow-2xl hover:border-purple-400 transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Organizer Login
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in as an organizer to manage hackathons, view registrations, and track participants.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Manage your hackathon events</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">View registrations & analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600">✓</span>
                  </div>
                  <span className="text-gray-700 text-sm">Control teams and participants</span>
                </div>
              </div>
              
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:gap-3">
                Sign In as Organizer
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </Link>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
