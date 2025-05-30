import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

const GoogleCallback = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    const processCallback = async () => {
      if (error) {
        showNotification(`Authentication failed: ${error}`, 'error');
        navigate('/login');
        return;
      }
      
      if (!token) {
        showNotification('No authentication token received', 'error');
        navigate('/login');
        return;
      }
      
      try {
        const result = await handleGoogleCallback(token);
        if (result.success) {
          showNotification('Login successful!', 'success');
          navigate('/');
        } else {
          showNotification(result.message || 'Authentication failed', 'error');
          navigate('/login');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        showNotification('Authentication failed', 'error');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    processCallback();
  }, [location, navigate, handleGoogleCallback, showNotification]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-rose-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6">
          <svg className="animate-spin h-10 w-10 text-[#620000] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Google Login</h2>
        <p className="text-gray-600">Please wait while we authenticate you...</p>
      </div>
    </div>
  );
};

export default GoogleCallback; 