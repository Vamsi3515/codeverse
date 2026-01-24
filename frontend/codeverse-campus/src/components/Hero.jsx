import React from 'react'

// Hero section for the landing page
// Clean hero with centered heading and subtitle — no action buttons.
export default function Hero(){
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-content" style={{textAlign:'center'}}>
          <h1 className="hero-tag">Create • Participate • Win Hackathons</h1>
          <p className="hero-sub">The central hub for student innovators to discover, compete, and create the future of hackathons across the nation.</p>
        </div>
      </div>

      <div className="hero-right" aria-hidden>
        {/* decorative panel / illustration placeholder */}
      </div>
    </section>
  )
}
