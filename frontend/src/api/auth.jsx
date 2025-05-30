import api, { handleApiResponse } from '../utils/api';
import { AUTH_LOGIN, AUTH_FORGOT_PASSWORD, AUTH_RESET_PASSWORD, AUTH_ME } from '../constants/api';

/**
 * Login user with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - API response
 */
export const login = async (email, password) => {
  return handleApiResponse(
    api.post(AUTH_LOGIN, { email, password })
  );
};

/**
 * Send forgot password request
 * 
 * @param {string} email - User email
 * @returns {Promise} - API response
 */
export const forgotPassword = async (email) => {
  return handleApiResponse(
    api.post(AUTH_FORGOT_PASSWORD, { email })
  );
};

/**
 * Reset password with token
 * 
 * @param {string} token - Reset password token
 * @param {string} newPassword - New password
 * @returns {Promise} - API response
 */
export const resetPassword = async (token, newPassword) => {
  return handleApiResponse(
    api.post(AUTH_RESET_PASSWORD, { token, newPassword })
  );
};

/**
 * Get current user info
 * 
 * @returns {Promise} - API response
 */
export const getCurrentUser = async () => {
  return handleApiResponse(
    api.get(AUTH_ME)
  );
};