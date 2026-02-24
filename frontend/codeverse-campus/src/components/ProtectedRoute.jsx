import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export function ProtectedRoute({ children, requiredRole = null }) {
  const { isLoggedIn, userRole, isLoading } = useAuth();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }


  if (!isLoggedIn) {
    console.warn('⚠️ SECURITY: Attempt to access protected route without authentication. Redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  
  if (requiredRole && userRole !== requiredRole) {
    console.warn(`⚠️ SECURITY: User role '${userRole}' does not match required role '${requiredRole}'. Redirecting...`);
    return <Navigate to="/dashboard/student" replace />;
  }

 
  return children;
}


export function StudentProtectedRoute({ children }) {
  return <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;
}

/**
 * OrganizerProtectedRoute Component
 * Ensures user is authenticated AND has 'organizer' role
 */
export function OrganizerProtectedRoute({ children }) {
  return <ProtectedRoute requiredRole="organizer">{children}</ProtectedRoute>;
}

export default ProtectedRoute;
