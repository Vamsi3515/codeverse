import React from 'react'
import { Link } from 'react-router-dom'

export default function SignIn(){
  return (
    <div style={{maxWidth:720, margin:'28px auto', background:'var(--card-bg)', borderRadius:12, padding:24, boxShadow:'var(--shadow)'}}>
      <h2 style={{margin:0}}>Sign In</h2>
      <p style={{color:'var(--muted)',marginTop:8}}>Welcome back — sign in to continue.</p>

      <form style={{display:'flex',flexDirection:'column',gap:12,marginTop:18}} onSubmit={(e)=>{e.preventDefault(); alert('Sign in submitted (UI-only)')}}>
        <input placeholder="Email" type="email" required style={{padding:12,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)'}} />
        <input placeholder="Password" type="password" required style={{padding:12,borderRadius:8,border:'1px solid rgba(15,23,42,0.06)'}} />
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button className="btn btn-primary" style={{padding:'6px 10px', fontSize:13, lineHeight:1}}>Sign In</button>
          <Link to="/signup" style={{color:'var(--muted)',fontWeight:700}}>Create account</Link>
        </div>
      </form>
    </div>
  )
}
