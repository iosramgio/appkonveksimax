import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const OwnerRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking auth
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Save current location to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Check if user is an owner
  if (!user || user.role !== 'owner') {
    // If user is logged in but not owner, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render owner routes
  return <Outlet />;
};

export default OwnerRoute;