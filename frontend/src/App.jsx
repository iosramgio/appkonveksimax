import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRouter from './routes/AppRouter';
import './assets/styles/index.css';

// Component to track and save navigation
const NavigationTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // This is handled in AppRouter now, but keeping as a backup
  }, [location]);
  
  return null;
};

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isTouchDevice] = useState('ontouchstart' in window);

  useEffect(() => {
    // Small delay for mobile devices to ensure proper page transition
    const scrollTimeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: isTouchDevice ? 'auto' : 'instant' // Use 'auto' for touch devices
      });
    }, isTouchDevice ? 100 : 0);

    return () => clearTimeout(scrollTimeout);
  }, [pathname, isTouchDevice]);

  return null;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <NavigationTracker />
            <ScrollToTop />
            <AppRouter />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
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