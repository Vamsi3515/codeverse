import React from 'react'

export default function Button({children, onClick, className = '', ariaLabel, style}){
  return (
    <button aria-label={ariaLabel} className={className} onClick={onClick} style={style}>
      {children}
    </button>
  )
}
