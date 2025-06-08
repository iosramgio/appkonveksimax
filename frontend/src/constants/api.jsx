// Base API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
//export const API_URL = 'https://appkonveksimax.onrender.com/api';

// Auth endpoints
export const AUTH_LOGIN = '/auth/login';
export const AUTH_REGISTER = '/auth/register';
export const AUTH_FORGOT_PASSWORD = '/auth/forgot-password';
export const AUTH_RESET_PASSWORD = '/auth/reset-password';
export const AUTH_ME = '/auth/me';

// User endpoints
export const USERS = '/users';
export const USER_PROFILE = '/users/profile';

// Product endpoints
export const PRODUCTS = '/products';
export const PRODUCT_CATEGORIES = '/products/categories';
export const PRODUCT_MATERIALS = '/materials';
export const PRODUCT_COLORS = '/colors';

// Order endpoints
export const ORDERS = '/orders';
export const ORDERS_MANUAL = '/orders/manual';
export const ORDERS_PRODUCTION = '/orders/production';
export const ORDER_STATUS = '/orders/:orderId/status';

// Payment endpoints
export const PAYMENTS = '/payments';
export const PAYMENT_VERIFY = '/payments/:paymentId/verify';
export const PAYMENT_CONFIRM = '/payments/confirm';
export const MIDTRANS_TOKEN = '/payments/snap';

// Dashboard endpoints
export const DASHBOARD_ADMIN = '/dashboard/admin';
export const DASHBOARD_CASHIER = '/dashboard/cashier';
export const DASHBOARD_STAFF = '/dashboard/staff';
export const DASHBOARD_OWNER = '/dashboard/owner';
export const DASHBOARD_CUSTOMER = '/customer/dashboard';

// Report endpoints
export const REPORTS_SALES = '/reports/sales';
export const REPORTS_FINANCIAL = '/reports/finance';
export const REPORTS_EXPORT = '/reports/:type/export';

// Backup endpoints
export const BACKUP = '/backup';
export const BACKUP_RESTORE = '/backup/:backupId/restore';
export const BACKUP_DOWNLOAD = '/backup/:backupId/download';
export const BACKUP_UPLOAD = '/backup/upload';

// Log endpoints
export const LOGS = '/logs';

export default {
  API_URL,
  AUTH_LOGIN,
  AUTH_REGISTER,
  AUTH_FORGOT_PASSWORD,
  AUTH_RESET_PASSWORD,
  AUTH_ME,
  USERS,
  USER_PROFILE,
  PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_MATERIALS,
  PRODUCT_COLORS,
  ORDERS,
  ORDERS_MANUAL,
  ORDERS_PRODUCTION,
  ORDER_STATUS,
  PAYMENTS,
  PAYMENT_VERIFY,
  PAYMENT_CONFIRM,
  MIDTRANS_TOKEN,
  DASHBOARD_ADMIN,
  DASHBOARD_CASHIER,
  DASHBOARD_STAFF,
  DASHBOARD_OWNER,
  DASHBOARD_CUSTOMER,
  REPORTS_SALES,
  REPORTS_FINANCIAL,
  REPORTS_EXPORT,
  BACKUP,
  BACKUP_RESTORE,
  BACKUP_DOWNLOAD,
  BACKUP_UPLOAD,
  LOGS
};