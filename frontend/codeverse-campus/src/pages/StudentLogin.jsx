import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StudentLogin(){
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Inline eye icons to avoid extra dependencies
  const EyeIcon = ({ off = false }) => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 12S6.5 6 12 6s9.5 6 9.5 6-4 6-9.5 6S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
      {off && (
        <path
          d="M4 4l16 16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  )

  const fetchStudentProfile = async (token, userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.student?.liveSelfie) {
          localStorage.setItem('userSelfie', data.student.liveSelfie)
          console.log('✅ [PROFILE] Student selfie stored:', data.student.liveSelfie)
        }
      }
    } catch (error) {
      console.error('❌ [PROFILE] Failed to fetch student profile:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please enter email and password')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      })
      
      // Check if response is ok (status 200-299)
      if (!response.ok) {
        // Server responded with error status
        const data = await response.json()
        setError(data.message || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      const data = await response.json()
      
      if (data.success) {
        console.log('🔍 [LOGIN DEBUG] User data received:', data.user);
        console.log('📍 [LOGIN DEBUG] College:', data.user.college);
        console.log('📍 [LOGIN DEBUG] College Address:', data.user.collegeAddress);
        
        // Store authentication info using context
        const fullName = data.user.firstName + ' ' + data.user.lastName
        login(data.token, 'student', fullName, data.user.id)
        
        // Store email and registration number for team registration
        localStorage.setItem('userEmail', data.user.email)
        localStorage.setItem('userRegNumber', data.user.regNumber || '')
        
        // Store additional college info
        localStorage.setItem('userCollege', data.user.college || '')
        localStorage.setItem('userCollegeAddress', data.user.collegeAddress || data.user.college || '')
        
        console.log('📍 [LOGIN DEBUG] Stored userCollege:', localStorage.getItem('userCollege'));
        console.log('📍 [LOGIN DEBUG] Stored userCollegeAddress:', localStorage.getItem('userCollegeAddress'));
        console.log('✅ [LOGIN DEBUG] Stored userEmail:', localStorage.getItem('userEmail'));
        console.log('✅ [LOGIN DEBUG] Stored userRegNumber:', localStorage.getItem('userRegNumber'));
        
        // Fetch and store student profile with selfie
        fetchStudentProfile(data.token, data.user.id)
        
        // Navigate to dashboard
        navigate('/dashboard/student')
      } else {
        setError(data.message || 'Login failed. Please check your credentials.')
        setLoading(false)
      }
    } catch (err) {
      // Only show "unable to connect" for actual network errors
      console.error('Login error:', err)
      setError('Unable to connect to server. Please check if the server is running.')
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:720, margin:'28px auto', background:'var(--card-bg)', borderRadius:12, padding:24, boxShadow:'var(--shadow)'}}>
      <h2 style={{margin:0}}>Student Login</h2>
      <p style={{color:'var(--muted)',marginTop:8}}>Sign in to access your student dashboard.</p>

      {error && <div style={{marginTop:12, padding:12, background:'#fee', borderRadius:8, color:'#c00', fontSize:14}}>{error}</div>}

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12,marginTop:18}}>
        <input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required style={{padding:12,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)', textAlign:'left'}} />
        <div style={{position:'relative', display:'flex', alignItems:'center'}}>
          <input
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            style={{padding:12, paddingRight:44, borderRadius:8, border:'1px solid rgba(15,23,42,0.06)', textAlign:'left', width:'100%'}}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position:'absolute',
              right:12,
              top:'50%',
              transform:'translateY(-50%)',
              background:'none',
              border:'none',
              cursor:'pointer',
              padding:6,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              color:'#5b21b6'
            }}
          >
            <EyeIcon off={!showPassword} />
          </button>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'center'}}>
          <button className="btn btn-primary" style={{padding:'10px 16px'}} type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
