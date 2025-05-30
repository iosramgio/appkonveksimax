/**
 * Helper functions for navigation and session persistence
 */

/**
 * Get the last path visited by the user
 * This is used to restore the correct page after a refresh
 * 
 * @returns {string} - The last path or default path
 */
export const getLastPath = () => {
  const lastPath = sessionStorage.getItem('lastPath');
  return lastPath || '/';
};

/**
 * Save the current path to session storage
 * 
 * @param {string} path - The path to save
 */
export const saveCurrentPath = (path) => {
  if (path && !path.includes('/login') && !path.includes('/register')) {
    sessionStorage.setItem('lastPath', path);
  }
};

/**
 * Clear saved navigation state
 */
export const clearNavigationState = () => {
  sessionStorage.removeItem('lastPath');
}; 