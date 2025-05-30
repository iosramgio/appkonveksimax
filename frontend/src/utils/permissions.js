import { getUserFromToken } from './auth';

/**
 * Role definitions and hierarchy
 */
export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  STAFF: 'staff',
  OWNER: 'owner',
  CUSTOMER: 'customer'
};

/**
 * Role hierarchy - higher roles include permissions of lower roles
 */
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.CASHIER, ROLES.STAFF, ROLES.OWNER],
  [ROLES.CASHIER]: [ROLES.CASHIER],
  [ROLES.STAFF]: [ROLES.STAFF],
  [ROLES.OWNER]: [ROLES.OWNER],
  [ROLES.CUSTOMER]: [ROLES.CUSTOMER]
};

/**
 * Permission definitions by feature
 */
export const PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  VIEW_USERS: 'view_users',
  
  // Product management
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  VIEW_PRODUCTS: 'view_products',
  
  // Order management
  CREATE_ORDER: 'create_order',
  CREATE_MANUAL_ORDER: 'create_manual_order',
  UPDATE_ORDER: 'update_order',
  DELETE_ORDER: 'delete_order',
  VIEW_ORDERS: 'view_orders',
  CHANGE_ORDER_STATUS: 'change_order_status',
  
  // Order status changes
  CHANGE_TO_PROCESSED: 'change_to_processed',
  CHANGE_TO_PRODUCTION_COMPLETE: 'change_to_production_complete',
  CHANGE_TO_READY_FOR_DELIVERY: 'change_to_ready_for_delivery',
  
  // Payment management
  VIEW_PAYMENTS: 'view_payments',
  VERIFY_PAYMENT: 'verify_payment',
  
  // Report management
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Database management
  BACKUP_DATABASE: 'backup_database',
  RESTORE_DATABASE: 'restore_database',
  
  // Activity log
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  
  // New permissions for staff
  VIEW_ALL_ORDERS: 'view_all_orders',
  MANAGE_ORDERS: 'manage_orders'
};

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.CASHIER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_MANUAL_ORDER,
    PERMISSIONS.CHANGE_ORDER_STATUS,
    PERMISSIONS.CHANGE_TO_PROCESSED,
    PERMISSIONS.CHANGE_TO_READY_FOR_DELIVERY,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VERIFY_PAYMENT,
    PERMISSIONS.VIEW_REPORTS
  ],
  
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CHANGE_ORDER_STATUS,
    PERMISSIONS.CHANGE_TO_PRODUCTION_COMPLETE,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.MANAGE_ORDERS
  ],
  
  [ROLES.OWNER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],
  
  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_ORDER
  ]
};

/**
 * Check if the current user has a specific permission
 * 
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether the user has the permission
 */
export const hasPermission = (permission) => {
  const user = getUserFromToken();
  
  if (!user || !user.role) {
    return false;
  }
  
  const userRole = user.role;
  
  // Admin has all permissions
  if (userRole === ROLES.ADMIN) {
    return true;
  }
  
  // Check if the user's role has the permission
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

/**
 * Check if the current user has any of the specified permissions
 * 
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - Whether the user has any of the permissions
 */
export const hasAnyPermission = (permissions) => {
  const user = getUserFromToken();
  
  if (!user || !user.role) {
    return false;
  }
  
  const userRole = user.role;
  
  // Admin has all permissions
  if (userRole === ROLES.ADMIN) {
    return true;
  }
  
  // Check if the user's role has any of the permissions
  return permissions.some(permission => ROLE_PERMISSIONS[userRole]?.includes(permission)) || false;
};

/**
 * Check if the current user has a specific role
 * 
 * @param {string|string[]} roles - Role or roles to check
 * @returns {boolean} - Whether the user has the role
 */
export const hasRole = (roles) => {
  const user = getUserFromToken();
  
  if (!user || !user.role) {
    return false;
  }
  
  const userRole = user.role;
  
  // Check if user has the role directly
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

/**
 * Check if the current user can access a specific role's permissions
 * (based on role hierarchy)
 * 
 * @param {string} targetRole - Role to check access for
 * @returns {boolean} - Whether the user can access the role
 */
export const canAccessRole = (targetRole) => {
  const user = getUserFromToken();
  
  if (!user || !user.role) {
    return false;
  }
  
  const userRole = user.role;
  
  // Check if the user's role includes the target role according to hierarchy
  return ROLE_HIERARCHY[userRole]?.includes(targetRole) || false;
};

/**
 * Check if user can change order status
 * 
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - New order status
 * @returns {boolean} - Whether the user can change the status
 */
export const canChangeOrderStatus = (currentStatus, newStatus) => {
  const user = getUserFromToken();
  
  if (!user || !user.role) {
    return false;
  }
  
  const userRole = user.role;
  
  // Admin can change any status
  if (userRole === ROLES.ADMIN) {
    return true;
  }
  
  // Cashier role permissions
  if (userRole === ROLES.CASHIER) {
    // Cashier can change status to "Diproses" and from "Selesai Produksi" to "Siap Kirim"
    if (
      (currentStatus === 'Pesanan Diterima' && newStatus === 'Diproses') ||
      (currentStatus === 'Selesai Produksi' && newStatus === 'Siap Kirim')
    ) {
      return true;
    }
  }
  
  // Staff role permissions
  if (userRole === ROLES.STAFF) {
    // Staff can only change from "Diproses" to "Selesai Produksi"
    if (currentStatus === 'Diproses' && newStatus === 'Selesai Produksi') {
      return true;
    }
  }
  
  return false;
};

/**
 * Get all permissions for a role
 * 
 * @param {string} role - Role to get permissions for
 * @returns {Array} - List of permissions for the role
 */
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if user can access a specific page/route
 * 
 * @param {string} route - Route path to check
 * @returns {boolean} - Whether the user can access the route
 */
export const canAccessRoute = (route) => {
  const user = getUserFromToken();
  
  if (!user || !user.role) {
    // Public routes can be accessed without login
    if (
      route === '/' ||
      route === '/login' ||
      route === '/forgot-password' ||
      route.startsWith('/products')
    ) {
      return true;
    }
    return false;
  }
  
  const userRole = user.role;
  
  // Admin can access all routes
  if (userRole === ROLES.ADMIN) {
    return true;
  }
  
  // Role-specific route checks
  if (userRole === ROLES.CASHIER) {
    if (route.startsWith('/cashier') || route.startsWith('/products')) {
      return true;
    }
  }
  
  if (userRole === ROLES.STAFF) {
    if (route.startsWith('/staff') || route.startsWith('/products')) {
      return true;
    }
  }
  
  if (userRole === ROLES.OWNER) {
    if (route.startsWith('/owner') || route.startsWith('/products')) {
      return true;
    }
  }
  
  if (userRole === ROLES.CUSTOMER) {
    if (
      route.startsWith('/customer') ||
      route.startsWith('/products') ||
      route.startsWith('/checkout')
    ) {
      return true;
    }
  }
  
  // Public routes are accessible by all
  if (
    route === '/' ||
    route === '/login' ||
    route === '/forgot-password' ||
    route.startsWith('/products')
  ) {
    return true;
  }
  
  return false;
};