import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);

  // Check auth state on mount
  useEffect(() => {
    checkAuthState();
    
    // Listen for storage changes (logout from other tabs)
    window.addEventListener('storage', checkAuthState);
    return () => window.removeEventListener('storage', checkAuthState);
  }, []);

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
    }
  };

  const login = (token, role, name, id) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    localStorage.setItem('userId', id);
    
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('organizerToken');
    localStorage.removeItem('organizerLoggedIn');
    localStorage.removeItem('organizerName');
    
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userRole,
      userName,
      userId,
      login,
      logout,
      checkAuthState
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
