import React from 'react'
import { Link } from 'react-router-dom'

export default function LoginSelect(){
  return (
    <div style={{maxWidth:900,margin:'40px auto',padding:20}}>
      <div style={{background:'var(--card-bg)',borderRadius:12,padding:28,boxShadow:'var(--shadow)'}}>
        <h2 style={{margin:0}}>Login</h2>
        <p style={{color:'var(--muted)',marginTop:8}}>Choose how you want to sign in.</p>

        <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:20,flexWrap:'wrap'}}>
          <Link to="/login/student" className="btn btn-primary" style={{width:'min(240px,90vw)',height:44,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:15,padding:'0 20px',borderRadius:999,textAlign:'center'}}>Login as Student</Link>
          <Link to="/login/organizer" className="btn btn-primary" style={{width:'min(240px,90vw)',height:44,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:15,padding:'0 20px',borderRadius:999,textAlign:'center'}}>Login as Organizer</Link>
        </div>
      </div>
    </div>
  )
}
