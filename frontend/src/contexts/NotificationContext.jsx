import React, { createContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const NotificationContext = createContext({
  notifications: [],
  notify: () => {},
  markAsRead: () => {},
  clearNotifications: () => {}
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification to the state and show toast
  const notify = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now();
    
    const newNotification = {
      id,
      message,
      type,
      read: false,
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      default:
        toast.info(message, options);
    }
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    notify,
    markAsRead,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};