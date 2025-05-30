// Public routes
export const HOME = '/';
export const ABOUT = '/about';
export const PRODUCTS = '/products';
export const PRODUCT_DETAIL = '/products/:productId';
export const LOGIN = '/login';
export const FORGOT_PASSWORD = '/forgot-password';
export const RESET_PASSWORD = '/reset-password/:token';

// Customer routes
export const CUSTOMER_DASHBOARD = '/customer/dashboard';
export const CUSTOMER_ORDERS = '/customer/orders';
export const CUSTOMER_ORDER_DETAIL = '/customer/orders/:orderId';
export const CUSTOMER_PROFILE = '/customer/profile';
export const CHECKOUT = '/customer/checkout';

// Admin routes
export const ADMIN_DASHBOARD = '/admin/dashboard';
export const ADMIN_USERS = '/admin/users';
export const ADMIN_USER_CREATE = '/admin/users/create';
export const ADMIN_USER_EDIT = '/admin/users/edit/:userId';
export const ADMIN_PRODUCTS = '/admin/products';
export const ADMIN_PRODUCT_CREATE = '/admin/products/create';
export const ADMIN_PRODUCT_EDIT = '/admin/products/edit/:productId';
export const ADMIN_BACKUP = '/admin/backup';
export const ADMIN_LOGS = '/admin/logs';

// Cashier routes
export const CASHIER_DASHBOARD = '/cashier/dashboard';
export const CASHIER_ORDERS = '/cashier/orders';
export const CASHIER_ORDER_CREATE = '/cashier/orders/create';
export const CASHIER_ORDER_DETAIL = '/cashier/orders/:orderId';
export const CASHIER_PAYMENTS = '/cashier/payments';

// Staff routes
export const STAFF_DASHBOARD = '/staff/dashboard';
export const STAFF_PRODUCTION = '/staff/production';

// Owner routes
export const OWNER_DASHBOARD = '/owner/dashboard';
export const OWNER_REPORTS = '/owner/reports';

// Error routes
export const UNAUTHORIZED = '/unauthorized';
export const NOT_FOUND = '*';

export default {
  HOME,
  ABOUT,
  PRODUCTS,
  PRODUCT_DETAIL,
  LOGIN,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  CUSTOMER_DASHBOARD,
  CUSTOMER_ORDERS,
  CUSTOMER_ORDER_DETAIL,
  CUSTOMER_PROFILE,
  CHECKOUT,
  ADMIN_DASHBOARD,
  ADMIN_USERS,
  ADMIN_USER_CREATE,
  ADMIN_USER_EDIT,
  ADMIN_PRODUCTS,
  ADMIN_PRODUCT_CREATE,
  ADMIN_PRODUCT_EDIT,
  ADMIN_BACKUP,
  ADMIN_LOGS,
  CASHIER_DASHBOARD,
  CASHIER_ORDERS,
  CASHIER_ORDER_CREATE,
  CASHIER_ORDER_DETAIL,
  CASHIER_PAYMENTS,
  STAFF_DASHBOARD,
  STAFF_PRODUCTION,
  OWNER_DASHBOARD,
  OWNER_REPORTS,
  UNAUTHORIZED,
  NOT_FOUND
};