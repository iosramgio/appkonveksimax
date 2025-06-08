import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = () => {
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
  
  // Check if user is an admin
  if (!user || user.role !== 'admin') {
    // If user is logged in but not admin, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render admin routes
  return <Outlet />;
};

export default AdminRoute;