import React from 'react'

// Filter UI (controlled)
// Props:
// - onSearch(text)
// - activeFilter: 'all' | 'online' | 'nearby'
// - onFilterChange(filter)
export default function Filters({onSearch, activeFilter = 'all', onFilterChange}){
  return (
    <div className="filter-bar">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="tabs">
          <div className={`tab ${activeFilter==='all'?'active':''}`} onClick={()=>onFilterChange && onFilterChange('all')}>All Events</div>
          <div className={`tab ${activeFilter==='online'?'active':''}`} onClick={()=>onFilterChange && onFilterChange('online')}>Online</div>
          <div className={`tab ${activeFilter==='nearby'?'active':''}`} onClick={()=>onFilterChange && onFilterChange('nearby')}>Near Me</div>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div className="search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <input placeholder="Search hackathons" onChange={e=> onSearch && onSearch(e.target.value)} />
        </div>
      </div>
    </div>
  )
}
