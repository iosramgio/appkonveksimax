import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';

const MainLayout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Check if current route is a dashboard route
  const isDashboardRoute = 
    location.pathname.includes('/admin') ||
    location.pathname.includes('/cashier') ||
    location.pathname.includes('/staff') ||
    location.pathname.includes('/owner');
  
  // Check if current route is an auth route
  const isAuthRoute = 
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.includes('/reset-password');
  
  // Handle sidebar toggle from child components
  const handleSidebarToggle = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };
  
  // On mobile, collapse sidebar by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    // Initial check
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Don't show header and footer on auth pages
  if (isAuthRoute) {
    return <Outlet />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex flex-1">
        {isDashboardRoute && <Sidebar onToggle={handleSidebarToggle} />}
        
        <main className={`flex-1 transition-all duration-300 ${
          isDashboardRoute ? (sidebarCollapsed ? 'ml-0 sm:ml-20' : 'ml-0 sm:ml-64') : ''
        } mt-16 bg-gray-50`}>
          <Outlet />
        </main>
      </div>
      
      {!isDashboardRoute && <Footer />}
      {!isDashboardRoute && !isAuthRoute && <WhatsAppButton />}
    </div>
  );
};

export default MainLayout;