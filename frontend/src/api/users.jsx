import api, { handleApiResponse } from '../utils/api';
import { USERS, USER_BY_ID } from '../constants/api';

/**
 * Get all users
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response
 */
export const getUsers = async (params = {}) => {
  return handleApiResponse(
    api.get(USERS, { params })
  );
};

/**
 * Get user by ID
 * 
 * @param {string} id - User ID
 * @returns {Promise} - API response
 */
export const getUserById = async (id) => {
  return handleApiResponse(
    api.get(USER_BY_ID(id))
  );
};

/**
 * Create new user
 * 
 * @param {Object} userData - User data
 * @returns {Promise} - API response
 */
export const createUser = async (userData) => {
  return handleApiResponse(
    api.post(USERS, userData)
  );
};

/**
 * Update user
 * 
 * @param {string} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise} - API response
 */
export const updateUser = async (id, userData) => {
  return handleApiResponse(
    api.patch(USER_BY_ID(id), userData)
  );
};

/**
 * Delete user
 * 
 * @param {string} id - User ID
 * @returns {Promise} - API response
 */
export const deleteUser = async (id) => {
  return handleApiResponse(
    api.delete(USER_BY_ID(id))
  );
};

/**
 * Update user profile
 * 
 * @param {string} id - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} - API response
 */
export const updateProfile = async (id, profileData) => {
  return handleApiResponse(
    api.patch(USER_BY_ID(id), profileData)
  );
};

/**
 * Change user password
 * 
 * @param {string} id - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} - API response
 */
export const changePassword = async (id, currentPassword, newPassword) => {
  return handleApiResponse(
    api.post(`${USER_BY_ID(id)}/change-password`, {
      currentPassword,
      newPassword
    })
  );
};