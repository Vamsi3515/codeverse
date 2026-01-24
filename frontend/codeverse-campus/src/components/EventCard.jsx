import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './EventCard.module.css'

// Reusable EventCard for landing page
// Props:
// - event: {id,title,organizer,techStack,date,type,location,imageUrl}
// - onRegister(event)
export default function EventCard({event, onRegister, primaryLabel}){
  const navigate = useNavigate()
  const {title, organizer, techStack, date, type, location, imageUrl} = event

  const t = String(type || '').toLowerCase()
  const badgeClass = t === 'online' ? styles.badgeOnline : styles.badgeOffline

  // Image loading / fallback logic
  const FALLBACK = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'
  const [src, setSrc] = useState(imageUrl || FALLBACK)
  const [loaded, setLoaded] = useState(false)

  useEffect(()=>{
    setSrc(imageUrl || FALLBACK)
    setLoaded(false)
  },[imageUrl])

  const handleImgError = () => {
    if(src !== FALLBACK){
      setSrc(FALLBACK)
    } else {
      setLoaded(true)
    }
  }

  const handleRegister = () => {
    if(onRegister) return onRegister(event)
    navigate('/signup')
  }

  return (
    <article className={styles.card}>
      <div className={styles.headerOverlay}>
        {!loaded && (
          <div className={styles.placeholder}><div className={styles.placeholderInner}></div></div>
        )}
        <img src={src} alt={title} className={`${styles.banner} ${loaded?styles.bannerVisible:styles.bannerHidden}`} onLoad={()=>setLoaded(true)} onError={handleImgError} />
        <div className={`${styles.badge} ${badgeClass}`}>{type}</div>
      </div>

      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          <div className={styles.organizer}>{organizer}</div>
          <div className={styles.tech}>{techStack}</div>

          <div className={styles.metaRow}>
          <div className={styles.infoLine}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none"><path d="M8 7V3h8v4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="7" width="18" height="13" rx="2" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>{date}</div>
          </div>

          {t === 'offline' && (
            <div className={styles.infoLine}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none"><path d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 1118 0z" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div>{location}</div>
            </div>
          )}
          </div>
        </div>

        <button className={styles.registerBtn} onClick={handleRegister}>{primaryLabel || 'Register Now'}</button>
      </div>
    </article>
  )
}
