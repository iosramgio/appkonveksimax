import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';

const PrivateRoute = ({ roles }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = usePermission();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated, but save the current location
  if (!isAuthenticated) {
    // Don't redirect if URL contains token (might be a callback)
    if (location.search.includes('token=')) {
      return <Outlet />;
    }
    
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check role permissions if roles are specified
  if (roles && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render child routes
  return <Outlet />;
};

export default PrivateRoute;