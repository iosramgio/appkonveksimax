import axios from 'axios';
import { getToken, removeToken } from './auth';
import { API_URL } from '../constants/api';

// Create an axios instance with default settings
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired or invalid token)
    if (error.response && error.response.status === 401) {
      // Remove the token from localStorage
      removeToken();
      
      // Redirect to login page if not already there
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API responses
 * 
 * @param {Promise} apiCall - API call promise
 * @returns {Promise} - Processed API response or error
 */
export const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};

/**
 * Upload file to the API
 * 
 * @param {string} endpoint - API endpoint
 * @param {File} file - File to upload
 * @param {Object} additionalData - Additional data for the request
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise} - API response
 */
export const uploadFile = async (endpoint, file, additionalData = {}, onProgress = null) => {
  const formData = new FormData();
  
  // Append file to form data
  formData.append('file', file);
  
  // Append additional data to form data
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });
  
  try {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress 
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          } 
        : undefined,
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};

export default api;