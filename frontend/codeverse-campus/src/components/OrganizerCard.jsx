import React from 'react'

// Reusable organizer-facing hackathon card
// Props:
// - item: hackathon data object
// - variant: 'previous' | 'active' | 'scheduled'
// - onPrimary: handler for primary action (Manage / View Details)
export default function OrganizerCard({item, variant, onPrimary}){
  const {title, type, date, startDate, venue, participants} = item

  const t = String(type || '').toLowerCase()
  const typeClass = t === 'online' ? 'badge-online' : 'badge-offline'
  const statusLabel = variant === 'active' ? 'Active' : variant === 'scheduled' ? 'Scheduled' : ''
  const statusClass = variant === 'active' ? 'badge-active' : variant === 'scheduled' ? 'badge-scheduled' : ''

  const primaryLabel = variant === 'previous' ? 'View Details' : 'Manage'

  return (
    <div className="card" style={{minWidth:260,borderRadius:12,boxShadow:'0 6px 18px rgba(30,30,60,0.06)'}}>
      <div className="card-body">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
          <div>
            <div className="title">{title}</div>
            <div className="meta" style={{marginTop:6}}>{venue} • <span style={{color:'var(--muted)'}}>{date || startDate}</span></div>

            { (variant === 'active' || variant === 'previous') && (
              <div style={{marginTop:8,fontSize:13}}><strong style={{color:'var(--muted)'}}>Participants:</strong> {participants ?? 0}</div>
            )}
          </div>

          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
            <div style={{display:'flex',gap:8}}>
              <div className={typeClass} style={{padding:'6px 8px',borderRadius:8,fontSize:12}}>{type}</div>
              {statusLabel && <div className={statusClass} style={{padding:'6px 8px',borderRadius:8,fontSize:12}}>{statusLabel}</div>}
            </div>

            <div>
              <button onClick={() => onPrimary && onPrimary(item)} style={{padding:'8px 12px',borderRadius:8}}>{primaryLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
