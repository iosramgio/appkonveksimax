import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { hasPermission, hasAnyPermission } from '../utils/permissions';

export const usePermission = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user has specific permission
  const checkPermission = useCallback((permission) => {
    if (!isAuthenticated || !user) return false;
    
    return hasPermission(user.role, permission);
  }, [isAuthenticated, user]);
  
  // Check if user has any of the given permissions
  const checkAnyPermission = useCallback((permissions) => {
    if (!isAuthenticated || !user) return false;
    
    return hasAnyPermission(user.role, permissions);
  }, [isAuthenticated, user]);
  
  // Check if user has one of the specified roles
  const hasRole = useCallback((roles) => {
    if (!isAuthenticated || !user) return false;
    
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return false;
  }, [isAuthenticated, user]);
  
  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasRole
  };
};

export default usePermission;