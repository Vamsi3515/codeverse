import React from 'react'
import { Link } from 'react-router-dom'

// SignUp options page: choose Student or Organizer path
export default function SignUp(){
  const btnStyle = {padding:'0 20px', borderRadius:999, width:'min(240px,90vw)', height:44, fontSize:15, display:'inline-flex', alignItems:'center', justifyContent:'center'}

  return (
    <div style={{maxWidth:940, margin:'28px auto'}}>
      <h2 style={{margin:0}}>Create an account</h2>
      <p style={{color:'var(--muted)',marginTop:8}}>Choose how you'd like to join CodeVerse Campus.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:20,marginTop:18}}>
        <div style={{background:'var(--card-bg)',padding:20,borderRadius:12,boxShadow:'var(--shadow)'}}>
          <h3 style={{marginTop:0}}>Sign Up as Student</h3>
          <p style={{color:'var(--muted)'}}>Register to participate in online and offline hackathons</p>
          <div style={{marginTop:24, display:'flex', justifyContent:'center'}}>
            <Link to="/signup/student" className="btn btn-primary" style={btnStyle}>Sign Up as Student</Link>
          </div>
        </div>

        <div style={{background:'var(--card-bg)',padding:20,borderRadius:12,boxShadow:'var(--shadow)'}}>
          <h3 style={{marginTop:0}}>Sign Up as Organizer</h3>
          <p style={{color:'var(--muted)'}}>Register to create and manage college hackathons</p>
          <div style={{marginTop:24, display:'flex', justifyContent:'center'}}>
            <Link to="/signup/organizer" className="btn btn-primary" style={btnStyle}>Sign Up as Organizer</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
