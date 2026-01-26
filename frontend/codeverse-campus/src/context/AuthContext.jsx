import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ NEW: Track auth initialization

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();
    
    // Listen for storage changes (logout from other tabs)
    window.addEventListener('storage', checkAuthState);
    
    // Security: Check session validity every 5 minutes
    const sessionCheckInterval = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      window.removeEventListener('storage', checkAuthState);
      clearInterval(sessionCheckInterval);
    };
  }, []);

  // ✅ SECURITY: Validate that session token is still valid
  const validateSession = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    // If token exists but role doesn't, clear everything (corrupted session)
    if (token && !role) {
      console.warn('⚠️ SECURITY: Corrupted session detected. Clearing auth state.');
      logout();
      return;
    }
    
    // Additional validation could check token expiry time
    // This is a basic check for token presence
  };

  const checkAuthState = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');

    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserName(name);
      setUserId(id);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
      setUserId(null);
      setUserProfile(null);
    }
    
    // ✅ NEW: Mark auth check as complete
    setIsLoading(false);
  };

  const login = (token, role, name, id, profile = null) => {
    // ✅ SECURITY: Validate role before setting
    const validRoles = ['student', 'organizer'];
    if (!validRoles.includes(role)) {
      console.error('❌ SECURITY: Invalid role attempted to login:', role);
      return false;
    }

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    localStorage.setItem('userId', id);
    localStorage.setItem('loginTimestamp', new Date().getTime());
    
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setUserId(id);
    setUserProfile(profile);
    
    return true;
  };

  const logout = () => {
    // Clear all auth data
    const keysToRemove = [
      'token',
      'userRole',
      'userId',
      'userName',
      'isLoggedIn',
      'organizerToken',
      'organizerLoggedIn',
      'organizerName',
      'loginTimestamp'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    setUserId(null);
    setUserProfile(null);
    
    console.log('✅ User logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userRole,
      userName,
      userId,
      userProfile,
      isLoading,
      login,
      logout,
      checkAuthState,
      validateSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
