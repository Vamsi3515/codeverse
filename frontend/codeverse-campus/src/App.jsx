import React from 'react'
import './App.css'
import './index.css'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import StudentRegister from './pages/StudentRegister'
import OrganizerRegister from './pages/OrganizerRegister'
import LoginSelect from './pages/LoginSelect'
import StudentLogin from './pages/StudentLogin'
import OrganizerLogin from './pages/OrganizerLogin'
import VerifyEmail from './pages/VerifyEmail'
import StudentDashboard from './pages/StudentDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import CreateHackathon from './pages/CreateHackathon'
import ManageHackathon from './pages/ManageHackathon'
import HackathonDetails from './pages/HackathonDetails'
import PreviousHackathonDetails from './pages/PreviousHackathonDetails'
import OnlineEditor from './pages/OnlineEditor'
import ViewRegistrations from './pages/ViewRegistrations'
import EditHackathon from './pages/EditHackathon'
import StudentRegistrationQR from './pages/StudentRegistrationQR'
import RegistrationVerification from './pages/RegistrationVerification'

// Dummy sample data used to render hackathon cards (no backend integration)
const SAMPLE = [
  // Hackathon (team coding)
  {id:1, imageUrl:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80', status:'Live', title:'HackTheValley', org:'Silicon University', date:'May 19-21, 2025', type:'offline'},
  // AI / ML (abstract AI visual)
  {id:2, imageUrl:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&q=80', status:'Live', title:'AI & ML Summit', org:'Auratea Eco Colliersity', date:'May 19-20, 2025', type:'online'},
  // Innovation / GreenTech (modern tech)
  {id:3, imageUrl:'https://images.unsplash.com/photo-1508385082359-f2a2f1c3d2d0?w=1200&q=80', status:'Upcoming', title:'GreenTech Challenge', org:'Ecu University', date:'May 1-3, 2025', type:'offline'},
  // Cybersecurity (code + security visual)
  {id:4, imageUrl:'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&q=80', status:'Upcoming', title:'CyberDefenders Hack', org:'National Defense Academy', date:'Aug 23-24, 2025', type:'offline'},
  // Innovation (modern workspace)
  {id:5, imageUrl:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80', status:'Upcoming', title:'Ergonomic Challenge', org:'Tech Institute of Innovation', date:'May 18-24, 2025', type:'online'},
  // GameJam (coding teamwork)
  {id:6, imageUrl:'https://images.unsplash.com/photo-1545239277-2f6b0d2f17c7?w=1200&q=80', status:'Upcoming', title:'GameJam 2025', org:'Creative Arts College', date:'Jun 5, 2025', type:'offline'}
]

function App(){
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/student" element={<StudentRegister />} />
          <Route path="/signup/organizer" element={<OrganizerRegister />} />
          <Route path="/login" element={<LoginSelect />} />
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/organizer" element={<OrganizerLogin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
          <Route path="/create-hackathon" element={<CreateHackathon />} />
          <Route path="/hackathon/:id/manage" element={<ManageHackathon />} />
          <Route path="/hackathon/:id/edit" element={<EditHackathon />} />
          <Route path="/hackathon/:hackathonId/registrations" element={<ViewRegistrations />} />
          <Route path="/hackathon/:id/details" element={<HackathonDetails />} />
          <Route path="/previous-hackathon-details" element={<PreviousHackathonDetails />} />
          <Route path="/editor/:id" element={<OnlineEditor />} />
          
          {/* Public QR Code Registration Details Page */}
          <Route path="/registration/:registrationId" element={<StudentRegistrationQR />} />
          
          {/* QR Code Verification Page - Shows full registration details when QR is scanned */}
          <Route path="/registration/verify/:registrationId" element={<RegistrationVerification />} />
          
          {/* Fallback to landing for unmatched routes */}
          <Route path="*" element={<Landing />} />
        </Routes>

        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
