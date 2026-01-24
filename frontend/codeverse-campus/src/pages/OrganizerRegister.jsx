import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api'
const ORGANIZER_EMAIL = '22b61a0557@sitam.co.in'

export default function OrganizerRegister() {
  const [activeTab, setActiveTab] = useState('register')
  const [registerFormData, setRegisterFormData] = useState({ fullName: '', phone: '', college: '', collegeEmail: '', role: 'HOD', password: '', confirmPassword: '', proofFile: null, proofDocumentUrl: '' })
  const [registerErrors, setRegisterErrors] = useState({})
  // Visibility toggles for password fields
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Inline eye icon (eye / eye-off) for password visibility toggles
  const EyeIcon = ({ off = false }) => (
    <svg
      width="20"
      height="20"
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

  const [loginFormData, setLoginFormData] = useState({ identifier: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})

  const [registerSuccess, setRegisterSuccess] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [proofUploadMessage, setProofUploadMessage] = useState('')
  const [proofUploadSuccess, setProofUploadSuccess] = useState(false)

  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const validateFile = (file) => {
    if (!file) return 'This field is required'
    const allowed = ['application/pdf', 'image/png', 'image/jpeg']
    if (!allowed.includes(file.type)) return 'Supported formats: PDF, JPG, PNG'
    if (file.size > 5 * 1024 * 1024) return 'File must be 5MB or smaller'
    return ''
  }

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    setRegisterFormData((prev) => ({ ...prev, proofFile: f || null }))
    setRegisterErrors((prev) => ({ ...prev, proofFile: '' }))
    setProofUploadSuccess(false)
    setProofUploadMessage('')
  }

  const isValidPhone = (p) => /^\+?[0-9\- ]{7,15}$/.test(p)

  const handleSendOtp = async () => {
    setOtpMessage('')
    setRegisterErrors((prev) => ({ ...prev, collegeEmail: '' }))

    const { collegeEmail, fullName } = registerFormData
    if (!collegeEmail) {
      setRegisterErrors((prev) => ({ ...prev, collegeEmail: 'College email is required' }))
      return
    }

    if (collegeEmail.toLowerCase() !== ORGANIZER_EMAIL) {
      setRegisterErrors((prev) => ({ ...prev, collegeEmail: 'Only authorized college admin email can register as organizer' }))
      return
    }

    setOtpLoading(true)
    try {
      const [firstName, ...rest] = (fullName || 'Organizer Admin').trim().split(' ')
      const payload = {
        email: collegeEmail.toLowerCase(),
        firstName: firstName || 'Organizer',
        lastName: rest.join(' ') || 'Admin'
      }
      const response = await fetch(`${API_URL}/auth/organizer/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (data.success) {
        setOtpSent(true)
        setOtpVerified(false)
        setOtpMessage('OTP sent to your email')
      } else {
        setOtpMessage(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setOtpMessage('Unable to send OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setOtpMessage('')
    if (!otpSent) {
      setOtpMessage('Please request an OTP first')
      return
    }
    if (!otpValue || otpValue.length !== 6) {
      setOtpMessage('Enter the 6-digit OTP')
      return
    }

    try {
      const response = await fetch(`${API_URL}/auth/organizer/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerFormData.collegeEmail.toLowerCase(), otp: otpValue })
      })
      const data = await response.json()
      if (data.success) {
        setOtpVerified(true)
        setOtpMessage('Email verified successfully')
      } else {
        setOtpVerified(false)
        setOtpMessage(data.message || 'OTP verification failed')
      }
    } catch (err) {
      setOtpVerified(false)
      setOtpMessage('Unable to verify OTP. Please try again.')
    }
  }

  const handleProofUpload = async () => {
    setProofUploadMessage('')

    const file = registerFormData.proofFile
    const fileErr = validateFile(file)
    if (fileErr) {
      setRegisterErrors((prev) => ({ ...prev, proofFile: fileErr }))
      return
    }

    const formData = new FormData()
    formData.append('proofDocument', file)

    try {
      const response = await fetch(`${API_URL}/auth/upload-proof`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        setProofUploadSuccess(true)
        setProofUploadMessage('Document uploaded successfully')
        // Replace file path with server URL for submission
        setRegisterFormData((prev) => ({ ...prev, proofDocumentUrl: data.url }))
      } else {
        setProofUploadSuccess(false)
        setProofUploadMessage(data.message || 'Failed to upload document')
      }
    } catch (err) {
      setProofUploadSuccess(false)
      setProofUploadMessage('Failed to upload document')
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    if (activeTab !== 'register') return
    setRegisterErrors({})
    setRegisterSuccess('')

    const errs = {}
    const { fullName, phone, college, collegeEmail, role, password, confirmPassword, proofFile, proofDocumentUrl } = registerFormData

    if (!fullName || !fullName.trim()) errs.fullName = 'This field is required'
    if (!phone || !phone.trim()) errs.phone = 'This field is required'
    else if (!isValidPhone(phone)) errs.phone = 'Enter a valid phone number'
    if (!college || !college.trim()) errs.college = 'This field is required'
    if (!collegeEmail || !collegeEmail.trim()) errs.collegeEmail = 'College email is required'
    else if (!collegeEmail.includes('@')) errs.collegeEmail = 'Please enter a valid email address'
    if (collegeEmail && collegeEmail.toLowerCase() !== ORGANIZER_EMAIL) {
      errs.collegeEmail = 'Only authorized college admin email can register as organizer'
    }
    if (!role) errs.role = 'This field is required'
    if (!password) errs.password = 'This field is required'
    if (!confirmPassword) errs.confirmPassword = 'This field is required'
    if (password && confirmPassword && password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    
    if (!proofFile) {
      errs.proofFile = validateFile(null)
    } else {
      const fileErr = validateFile(proofFile)
      if (fileErr) errs.proofFile = fileErr
    }

    if (!otpVerified) {
      errs.otp = 'Please verify the OTP before registering'
    }

    if (!proofUploadSuccess || !proofDocumentUrl) {
      errs.proofFile = errs.proofFile || 'Please upload the proof document before registering'
    }

    if (Object.keys(errs).length) {
      setRegisterErrors(errs)
      return
    }

    setLoading(true)
    try {
      const [firstName, ...lastNameParts] = fullName.trim().split(' ')
      const lastName = lastNameParts.join(' ') || firstName

      const response = await fetch(`${API_URL}/auth/organizer/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: collegeEmail.toLowerCase(),
          password: password,
          phone: phone,
          college: college,
          role: role,
          proofDocument: proofDocumentUrl
        })
      })

      const data = await response.json()

      if (data.success) {
        // Save token and user info
        localStorage.setItem('token', data.token)
        localStorage.setItem('organizerToken', data.token)
        localStorage.setItem('organizerLoggedIn', 'true')
        localStorage.setItem('isLoggedIn', '1')
        localStorage.setItem('userRole', 'organizer')
        localStorage.setItem('userId', data.user.id)
        localStorage.setItem('organizerName', fullName)
        localStorage.setItem('userCollege', college)
        
        setRegisterSuccess('Registration completed successfully!')
        setTimeout(() => {
          navigate('/dashboard/organizer')
        }, 1500)
      } else {
        setRegisterErrors({ general: data.message || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setRegisterErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (activeTab !== 'login') return
    setLoginErrors({})
    setLoginSuccess('')

    const errs = {}
    const { identifier, password } = loginFormData
    if (!identifier || !identifier.trim()) errs.identifier = 'This field is required'
    if (!password) errs.password = 'This field is required'

    if (Object.keys(errs).length) {
      setLoginErrors(errs)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/organizer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: identifier.includes('@') ? identifier : undefined,
          password 
        })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('organizerToken', data.token)
        localStorage.setItem('organizerLoggedIn', 'true')
        localStorage.setItem('isLoggedIn', '1')
        localStorage.setItem('userRole', 'organizer')
        localStorage.setItem('userId', data.user.id)
        localStorage.setItem('organizerName', `${data.user.firstName} ${data.user.lastName}`)
        localStorage.setItem('userCollege', data.user.college)
        
        navigate('/dashboard/organizer')
      } else {
        setLoginErrors({ general: data.message || 'Login failed. Please check your credentials.' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginErrors({ general: 'Unable to connect to server. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = { maxWidth: 720, margin: '32px auto', background: 'var(--card-bg)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow)' }
  const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  return (
    <div style={{ maxWidth: 760, margin: '28px auto' }}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 36, background: '#eef2ff', marginBottom: 12 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21h18v-2a2 2 0 0 0-2-2h-2V7.5a1.5 1.5 0 0 0-1.5-1.5H10A1.5 1.5 0 0 0 8.5 7.5V17H6a2 2 0 0 0-2 2v2z" fill="#4f46e5" />
              <rect x="9" y="9" width="2" height="2" fill="#fff" />
              <rect x="13" y="9" width="2" height="2" fill="#fff" />
            </svg>
          </div>
          <h2 style={{ margin: 0 }}>Organizer Portal</h2>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Login or register to manage hackathons</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveTab('login'); setRegisterErrors({}); setRegisterSuccess(''); setLoginErrors({}); setLoginSuccess('') }} aria-pressed={activeTab === 'login'} style={{ padding: '8px 14px', borderRadius: 10, border: activeTab === 'login' ? '1px solid #4f46e5' : '1px solid transparent', background: activeTab === 'login' ? '#eef2ff' : 'transparent' }}>Login</button>
          <button onClick={() => { setActiveTab('register'); setLoginErrors({}); setLoginSuccess(''); setRegisterErrors({}); setRegisterSuccess('') }} aria-pressed={activeTab === 'register'} style={{ padding: '8px 14px', borderRadius: 10, border: activeTab === 'register' ? '1px solid #4f46e5' : '1px solid transparent', background: activeTab === 'register' ? '#eef2ff' : 'transparent' }}>Register</button>
        </div>

        <div style={{ marginTop: 18 }}>
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
                <input placeholder="Email" value={loginFormData.identifier} onChange={e => setLoginFormData(prev => ({ ...prev, identifier: e.target.value }))} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }} />
                {loginErrors.identifier && <div style={{ color: '#b91c1c', fontSize: 13 }}>{loginErrors.identifier}</div>}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Password</span>
                <input placeholder="Password" type="password" value={loginFormData.password} onChange={e => setLoginFormData(prev => ({ ...prev, password: e.target.value }))} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }} />
                {loginErrors.password && <div style={{ color: '#b91c1c', fontSize: 13 }}>{loginErrors.password}</div>}
              </label>

              {loginErrors.general && <div style={{ color: '#b91c1c', padding: 8, borderRadius: 6, background: '#fee2e2', fontSize: 13 }}>{loginErrors.general}</div>}
              {loginSuccess && <div style={{ color: '#065f46' }}>{loginSuccess}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 6, justifyContent: 'center' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {registerSuccess && <div style={{ color: '#065f46', padding: 8, borderRadius: 8, background: '#ecfdf5' }}>{registerSuccess}</div>}
              {registerErrors.general && <div style={{ color: '#b91c1c', padding: 8, borderRadius: 8, background: '#fee2e2' }}>{registerErrors.general}</div>}

              <div style={twoCol}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'left' }}>Full Name</span>
                  <input placeholder="Full Name" value={registerFormData.fullName} onChange={e => setRegisterFormData(prev => ({ ...prev, fullName: e.target.value }))} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }} />
                  {registerErrors.fullName && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.fullName}</div>}
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'left' }}>Phone Number</span>
                  <input placeholder="Phone Number" value={registerFormData.phone} onChange={e => setRegisterFormData(prev => ({ ...prev, phone: e.target.value }))} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }} />
                  {registerErrors.phone && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.phone}</div>}
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'left' }}>College Name</span>
                <input placeholder="College Name" value={registerFormData.college} onChange={e => setRegisterFormData(prev => ({ ...prev, college: e.target.value }))} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }} />
                {registerErrors.college && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.college}</div>}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'left' }}>College Email</span>
                <div style={{ display: 'flex', gap: 8, width: '100%', flexWrap: 'wrap' }}>
                  <input placeholder="organizer@college.edu" value={registerFormData.collegeEmail} onChange={e => { setRegisterFormData(prev => ({ ...prev, collegeEmail: e.target.value })); setRegisterErrors(prev => ({ ...prev, collegeEmail: '' })); setOtpVerified(false); setOtpSent(false); setOtpMessage('') }} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%', minWidth: 220 }} required />
                  <button type="button" onClick={handleSendOtp} className="btn btn-secondary" style={{ padding: '10px 12px', borderRadius: 10 }} disabled={otpLoading}>
                    {otpLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && (
                  <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                    <input
                      placeholder="Enter 6-digit OTP"
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value)}
                      maxLength={6}
                      style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%', minWidth: 220 }}
                    />
                    <button type="button" onClick={handleVerifyOtp} className="btn btn-secondary" style={{ padding: '10px 12px', borderRadius: 10 }}>
                      Verify OTP
                    </button>
                  </div>
                )}
                {otpMessage && <div style={{ color: otpVerified ? '#065f46' : '#b91c1c', fontSize: 13 }}>{otpMessage}</div>}
                {registerErrors.collegeEmail && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.collegeEmail}</div>}
                {registerErrors.otp && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.otp}</div>}
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'left' }}>Role</span>
                <select value={registerFormData.role} onChange={e => setRegisterFormData(prev => ({ ...prev, role: e.target.value }))} style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }}>
                  <option>HOD</option>
                  <option>Faculty</option>
                  <option>Event Coordinator</option>
                </select>
                {registerErrors.role && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.role}</div>}
              </label>

              <div style={twoCol}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'left' }}>Password</span>
                  <div className="relative w-full">
                    <input
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerFormData.password}
                      onChange={e => setRegisterFormData(prev => ({ ...prev, password: e.target.value }))}
                      style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-3 flex items-center bg-transparent border-0 text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      <EyeIcon off={!showPassword} />
                    </button>
                  </div>
                  {registerErrors.password && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.password}</div>}
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'left' }}>Confirm Password</span>
                  <div className="relative w-full">
                    <input
                      placeholder="Confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerFormData.confirmPassword}
                      onChange={e => setRegisterFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(15,23,42,0.06)', width: '100%' }}
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute inset-y-0 right-3 flex items-center bg-transparent border-0 text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      <EyeIcon off={!showConfirmPassword} />
                    </button>
                  </div>
                  {registerErrors.confirmPassword && <div style={{ color: '#b91c1c', fontSize: 13 }}>{registerErrors.confirmPassword}</div>}
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 13, fontWeight: 700, textAlign: 'left' }}>Proof of Authorization <span style={{ color: '#dc2626' }}>*</span></span>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Upload: College ID, Appointment Letter, or Official Circular</div>

                <div onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ border: '2px dashed rgba(15,23,42,0.12)', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3 3h-2v6h-2V5H9l3-3z" fill="#4f46e5" />
                    <path d="M4 13v7h16v-7" stroke="#4f46e5" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Click to upload document</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>PDF, JPG, PNG (Max 5MB)</div>
                  {registerFormData.proofFile && <div style={{ marginTop: 8, fontSize: 13, color: '#064e3b' }}>Selected: {registerFormData.proofFile.name}</div>}
                </div>
                <input ref={fileInputRef} type="file" accept="application/pdf,image/png,image/jpeg" onChange={handleFileChange} style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleProofUpload} className="btn btn-secondary" style={{ padding: '10px 12px', borderRadius: 10 }}>
                    Upload Document
                  </button>
                  {proofUploadMessage && <span style={{ fontSize: 13, color: proofUploadSuccess ? '#065f46' : '#b91c1c' }}>{proofUploadMessage}</span>}
                </div>
                {registerErrors.proofFile && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>{registerErrors.proofFile}</div>}
              </label>

              <div style={{ textAlign: 'center', marginTop: 6 }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', borderRadius: 10, display: 'inline-block' }} disabled={loading || !otpVerified || !proofUploadSuccess}>{loading ? 'Registering...' : 'Register'}</button>
              </div>

              <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>By registering, you agree to our Terms of Service.</div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


