import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook to prevent browser back button navigation
 * Useful for pages like dashboard where we don't want users to go back to editor
 * 
 * @param {string} fallbackPath - Optional path to redirect to if back is pressed (defaults to current path)
 */
export const usePreventBackNavigation = (fallbackPath = null) => {
  const location = useLocation()

  useEffect(() => {
    // Get the current path as fallback
    const currentPath = fallbackPath || location.pathname

    // Replace current history entry - this prevents the current page from appearing in browser history
    window.history.replaceState({ prevented: true }, '', currentPath)

    // Add a new "sentinel" state to the history stack
    // When user clicks back, they'll hit this state first
    window.history.pushState({ sentinel: true }, '', currentPath)

    // Handle back button clicks
    const handlePopState = (event) => {
      // If this is our sentinel state, push it back on the stack
      if (event.state?.sentinel) {
        console.log('🔙 Back button blocked at sentinel - staying on page')
        window.history.pushState({ sentinel: true }, '', currentPath)
      } else {
        // Otherwise, also replace and push sentinel again
        console.log('🔙 Back button blocked - preventing navigation')
        window.history.replaceState({ prevented: true }, '', currentPath)
        window.history.pushState({ sentinel: true }, '', currentPath)
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [location.pathname, fallbackPath])
}

export default usePreventBackNavigation
