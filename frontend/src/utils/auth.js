import { jwtDecode } from 'jwt-decode';

/**
 * Get token from sessionStorage
 * 
 * @returns {string|null} - JWT token or null if not found
 */
export const getToken = () => {
  return sessionStorage.getItem('token');
};

/**
 * Set token in sessionStorage
 * 
 * @param {string} token - JWT token to store
 */
export const setToken = (token) => {
  sessionStorage.setItem('token', token);
};

/**
 * Remove token from sessionStorage
 */
export const removeToken = () => {
  sessionStorage.removeItem('token');
};

/**
 * Check if token is valid and not expired
 * 
 * @returns {boolean} - Whether the token is valid
 */
export const isTokenValid = () => {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      // Token is expired, remove it
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    // Token is invalid, remove it
    removeToken();
    return false;
  }
};

/**
 * Get user info from token
 * 
 * @returns {Object|null} - User info from token or null if token is invalid
 */
export const getUserFromToken = () => {
  const token = getToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      // Token is expired, remove it
      removeToken();
      return null;
    }
    
    return decoded.user || decoded;
  } catch (error) {
    // Token is invalid, remove it
    removeToken();
    return null;
  }
};

/**
 * Check if user has a specific role
 * 
 * @param {string|string[]} roles - Role or roles to check
 * @returns {boolean} - Whether the user has the role
 */
export const hasRole = (roles) => {
  const user = getUserFromToken();
  
  if (!user || !user.role) {
    return false;
  }
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};

/**
 * Get authorization header with token
 * 
 * @returns {Object} - Authorization header object
 */
export const getAuthHeader = () => {
  const token = getToken();
  
  if (!token) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Check if user is authenticated
 * 
 * @returns {boolean} - Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return isTokenValid() && !!getUserFromToken();
};