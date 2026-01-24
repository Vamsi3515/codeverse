import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OrganizerLogin(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

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
      const response = await fetch('http://localhost:5000/api/auth/organizer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Store authentication info using context
        const fullName = data.user.firstName + ' ' + data.user.lastName
        login(data.token, 'organizer', fullName, data.user.id)
        
        // Navigate to organizer dashboard
        navigate('/dashboard/organizer')
      } else {
        setError(data.message || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:720, margin:'28px auto', background:'var(--card-bg)', borderRadius:12, padding:24, boxShadow:'var(--shadow)'}}>
      <h2 style={{margin:0}}>Organizer Login</h2>
      <p style={{color:'var(--muted)',marginTop:8}}>Sign in to access your organizer dashboard.</p>

      {error && <div style={{marginTop:12, padding:12, background:'#fee', borderRadius:8, color:'#c00', fontSize:14}}>{error}</div>}

      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12,marginTop:18}}>
        <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{padding:12,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)', textAlign:'left'}} />
        <div style={{position:'relative', display:'flex', alignItems:'center'}}>
          <input placeholder="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} required style={{padding:12, paddingRight:40, borderRadius:8, border:'1px solid rgba(15,23,42,0.06)', textAlign:'left', width:'100%'}} />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position:'absolute',
              right:12,
              background:'none',
              border:'none',
              cursor:'pointer',
              fontSize:20,
              padding:4,
              display:'flex',
              alignItems:'center',
              justifyContent:'center'
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <div style={{display:'flex',gap:10,alignItems:'center',justifyContent:'center'}}>
          <button className="btn btn-primary" type="submit" style={{padding:'10px 16px'}} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </div>
      </form>
    </div>
  )
}
