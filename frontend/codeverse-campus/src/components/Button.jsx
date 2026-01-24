import React from 'react'

// Simple reusable Button component to keep visual consistency
// Props: children, onClick, className, ariaLabel
export default function Button({children, onClick, className = '', ariaLabel, style}){
  return (
    <button aria-label={ariaLabel} className={className} onClick={onClick} style={style}>
      {children}
    </button>
  )
}
