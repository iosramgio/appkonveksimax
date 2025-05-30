import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const CashierRoute = () => {
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
  
  // Check if user is a cashier
  if (!user || user.role !== 'cashier') {
    // If user is logged in but not cashier, redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render cashier routes
  return <Outlet />;
};

export default CashierRoute;