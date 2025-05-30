import React, { createContext, useReducer, useCallback, useState, useEffect } from 'react';
import api from '../utils/api';
import { getToken, setToken, removeToken } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../constants/api';

export const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  token: sessionStorage.getItem('token') || null,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      sessionStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      sessionStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [authCheckAttempted, setAuthCheckAttempted] = useState(false);

  // Configure api instance with token
  if (state.token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }

  // Check if token is valid and load user data
  const checkAuthStatus = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      dispatch({ type: 'AUTH_ERROR' });
      setAuthCheckAttempted(true);
      return;
    }

    try {
      // Check if token is expired
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        dispatch({ type: 'AUTH_ERROR', payload: 'Token expired' });
        setAuthCheckAttempted(true);
        return;
      }

      // Set auth token header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data
      const res = await api.get('/auth/profile');
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: res.data.user, token }
      });
      setAuthCheckAttempted(true);
    } catch (err) {
      console.error('Auth error:', err);
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.message || 'Authentication error'
      });
      setAuthCheckAttempted(true);
    }
  }, []);

  useEffect(() => {
    if (!authCheckAttempted) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, authCheckAttempted]);

  // Login user
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.token) {
        setToken(res.data.token);
        
        // Store user role in sessionStorage for quick access
        if (res.data.user && res.data.user.role) {
          sessionStorage.setItem('userRole', res.data.user.role);
        }
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          user: res.data.user,
          token: res.data.token
        }
      });
      
      return { success: true, user: res.data.user };
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.message || 'Login failed'
      });
      
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Google login
  const googleLogin = async (tokenResponse) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Get user info from Google token
      const googleUser = tokenResponse.profile;
      
      // Send token to backend for verification
      const res = await api.post('/auth/google/verify', {
        token: tokenResponse.credential,
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        imageUrl: googleUser.picture
      });
      
      if (res.data.token) {
        setToken(res.data.token);
        
        // Store user role in sessionStorage for quick access
        if (res.data.user && res.data.user.role) {
          sessionStorage.setItem('userRole', res.data.user.role);
        }
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          user: res.data.user,
          token: res.data.token
        }
      });
      
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error('Google login error:', err);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.message || 'Google login failed'
      });
      
      return { 
        success: false, 
        message: err.response?.data?.message || 'Google login failed' 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = async (token) => {
    if (!token) return { success: false, message: 'No token provided' };
    
    try {
      // Set token in local storage
      setToken(token);
      
      // Get user data
      const res = await api.get('/auth/profile');
      
      // Store user role in sessionStorage for quick access
      if (res.data.user && res.data.user.role) {
        sessionStorage.setItem('userRole', res.data.user.role);
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { 
          user: res.data.user, 
          token 
        }
      });
      
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error('Google callback error:', err);
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.response?.data?.message || 'Authentication error'
      });
      
      return { 
        success: false, 
        message: err.response?.data?.message || 'Authentication error' 
      };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Register user
  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const res = await api.post('/auth/register', userData);
      
      return { 
        success: true,
        message: 'Registration successful'
      };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed' 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Check if user has permission based on role
  const hasPermission = (requiredRoles) => {
    if (!state.user) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(state.user.role);
    }
    
    return state.user.role === requiredRoles;
  };

  // Clear any errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        googleLogin,
        handleGoogleCallback,
        logout,
        register,
        checkAuthStatus,
        hasPermission,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};