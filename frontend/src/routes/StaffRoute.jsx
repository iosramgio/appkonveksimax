import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const StaffRoute = () => {
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
  
  // Check if user is staff
  if (!user || user.role !== 'staff') {
    // If user is logged in but not staff, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render staff routes
  return <Outlet />;
};

export default StaffRoute;