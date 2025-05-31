import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRouter from './routes/AppRouter';
import './assets/styles/index.css';
import { initAOS, refreshAOS } from './utils/aos-config';

// Component to track and save navigation
const NavigationTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // This is handled in AppRouter now, but keeping as a backup
    // Refresh AOS animations on route change for smoother transitions
    refreshAOS();
    // Scroll to top smoothly on page change
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location]);
  
  return null;
};

const App = () => {
  useEffect(() => {
    // Initialize AOS with optimized settings
    initAOS();
    
    // Add event listener for window resize to refresh AOS
    const handleResize = () => {
      refreshAOS();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <NavigationTracker />
            <AppRouter />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;