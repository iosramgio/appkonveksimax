import { useState, useCallback } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://appkonveksimax.onrender.com/api',
  timeout: 60000, // Increase to 60 seconds for development
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage instead of localStorage
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - server might be down or unreachable');
      return Promise.reject(new Error('Tidak dapat terhubung ke server. Silakan coba lagi nanti.'));
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('Permintaan timeout. Silakan coba lagi.'));
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Sesi anda telah berakhir. Silakan login kembali.'));
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan';
    return Promise.reject(new Error(errorMessage));
  }
);

export const handleApiResponse = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Wrap API methods with loading and error handling
  const get = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(url, config);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const post = useCallback(async (url, data = {}, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(url, data, config);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const put = useCallback(async (url, data = {}, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(url, data, config);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const del = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(url, config);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const patch = useCallback(async (url, data = {}, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch(url, data, config);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    get,
    post,
    put,
    delete: del,
    patch,
    loading,
    error
  };
};

export default api;