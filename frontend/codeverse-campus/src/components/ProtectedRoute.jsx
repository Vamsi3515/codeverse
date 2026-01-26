import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Ensures user is authenticated before accessing the route
 * Redirects to appropriate login page if not authenticated
 */
export function ProtectedRoute({ children, requiredRole = null }) {
  const { isLoggedIn, userRole, isLoading } = useAuth();

  // ✅ NEW: Show loading spinner while checking auth
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

  // If not logged in, redirect to login selection
  if (!isLoggedIn) {
    console.warn('⚠️ SECURITY: Attempt to access protected route without authentication. Redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  // If route requires specific role, check it
  if (requiredRole && userRole !== requiredRole) {
    console.warn(`⚠️ SECURITY: User role '${userRole}' does not match required role '${requiredRole}'. Redirecting...`);
    return <Navigate to="/dashboard/student" replace />;
  }

  // User is authenticated and has required role
  return children;
}

/**
 * StudentProtectedRoute Component
 * Ensures user is authenticated AND has 'student' role
 */
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
