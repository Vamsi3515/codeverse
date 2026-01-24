import React from 'react'
import { Link } from 'react-router-dom'
import { Code2, Users, Trophy, Calendar, MapPin, Zap, Sparkles, Rocket, Target, Globe } from 'lucide-react'

export default function Landing(){

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      
      {/* Hero Section with Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80" 
            alt="Hackathon background" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/80 via-purple-100/80 to-pink-100/80"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 via-transparent to-purple-200/30 animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-8 sm:px-12 lg:px-16 py-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-200 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-indigo-900 text-xs font-medium">Welcome to the Future of Innovation</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-3">
            CodeVerse
            <span className="block mt-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Campus
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-gray-800 max-w-3xl mx-auto mb-3 font-normal">
            The Ultimate Platform for Student Innovators
          </p>

          <p className="text-sm sm:text-base text-gray-700 max-w-2xl mx-auto mb-6">
            Discover hackathons, connect with brilliant minds, compete for amazing prizes, and build solutions that change the world.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link 
              to="/signup" 
              className="group relative px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Rocket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Get Started Free
            </Link>
            <Link 
              to="/login" 
              className="px-6 py-2.5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-gray-900 font-semibold text-sm rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">500+</div>
              <div className="text-gray-600 text-xs">Hackathons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">50K+</div>
              <div className="text-gray-600 text-xs">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">1000+</div>
              <div className="text-gray-600 text-xs">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">$2M+</div>
              <div className="text-gray-600 text-xs">In Prizes</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border-2 border-indigo-400 rounded-full p-1">
            <div className="w-0.5 h-2 bg-indigo-400 rounded-full mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 bg-white">
        <div className="w-full px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Why Choose CodeVerse Campus?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Everything you need to organize, participate, and excel in hackathons - all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Discover Events</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Browse and filter hundreds of hackathons - online and offline, across all domains and skill levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-pink-100">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Build Teams</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Connect with talented developers, designers, and innovators. Form dream teams and collaborate seamlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-cyan-100">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Win Prizes</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Compete for amazing prizes, gain recognition, and showcase your skills to potential employers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-green-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Code & Create</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Access resources, mentorship, and tools to build innovative projects that solve real-world problems.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-orange-100">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Find Near You</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Discover offline hackathons happening near your location with integrated maps and directions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-violet-100">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Get instant notifications, calendar integration, and QR codes for seamless event management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80" 
            alt="Team collaboration" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative w-full px-8 sm:px-12 lg:px-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
              Get started in minutes and join the innovation revolution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-sm text-gray-700">Create your free account and set up your profile in seconds.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Explore</h3>
              <p className="text-sm text-gray-700">Browse hackathons that match your interests and skill level.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Participate</h3>
              <p className="text-sm text-gray-700">Register, build amazing projects, and compete for prizes!</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80" 
            alt="Innovation" 
            className="w-full h-full object-cover opacity-5"
          />
        </div>
        
        <div className="relative w-full px-8 sm:px-12 lg:px-16 text-center">
          <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-sm sm:text-base text-gray-700 mb-6 max-w-2xl mx-auto">
            Join thousands of students already building the future. Your next big idea starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to="/signup" 
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
            >
              <Globe className="w-4 h-4" />
              Join CodeVerse Campus
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="w-full px-8 sm:px-12 lg:px-16">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">CodeVerse Campus</h3>
            <p className="text-gray-400 text-sm mb-4">Empowering the next generation of innovators</p>
            <p className="text-gray-500 text-xs">© 2026 CodeVerse Campus. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
