import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  const showSuccess = (message, options = {}) => context.notify(message, 'success', options);
  const showError = (message, options = {}) => context.notify(message, 'error', options);
  const showWarning = (message, options = {}) => context.notify(message, 'warning', options);
  const showInfo = (message, options = {}) => context.notify(message, 'info', options);
  
  return {
    ...context,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useNotification;