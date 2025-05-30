// Auth Pages
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';

// Public Pages
import Home from './public/Home';
import About from './public/About';
import Products from './public/Products';
import ProductDetail from './public/ProductDetail';

// Customer Pages
import CustomerDashboard from './customer/Dashboard';
import CustomerOrders from './customer/Orders';
import OrderDetail from './customer/OrderDetail';
import Checkout from './customer/Checkout';
import Profile from './customer/Profile';

// Admin Pages
import AdminDashboard from './admin/Dashboard';
import UserManagement from './admin/UserManagement';
import ProductManagement from './admin/ProductManagement';
import BackupRestore from './admin/BackupRestore';
import ActivityLogs from './admin/ActivityLogs';

// Cashier Pages
import CashierDashboard from './cashier/Dashboard';
import ManualOrder from './cashier/ManualOrder';
import OrderManagement from './cashier/OrderManagement';
import PaymentVerification from './cashier/PaymentVerification';

// Staff Pages
import StaffDashboard from './staff/Dashboard';
import ProductionOrders from './staff/ProductionOrders';

// Owner Pages
import OwnerDashboard from './owner/Dashboard';
import Reports from './owner/Reports';

// Error Pages
import Unauthorized from './Error/Unauthorized';
import NotFound from './Error/NotFound';

export {
  // Auth Pages
  Login,
  ForgotPassword,
  
  // Public Pages
  Home,
  About,
  Products,
  ProductDetail,
  
  // Customer Pages
  CustomerDashboard,
  CustomerOrders,
  OrderDetail,
  Checkout,
  Profile,
  
  // Admin Pages
  AdminDashboard,
  UserManagement,
  ProductManagement,
  BackupRestore,
  ActivityLogs,
  
  // Cashier Pages
  CashierDashboard,
  ManualOrder,
  OrderManagement,
  PaymentVerification,
  
  // Staff Pages
  StaffDashboard,
  ProductionOrders,
  
  // Owner Pages
  OwnerDashboard,
  Reports,
  
  // Error Pages
  Unauthorized,
  NotFound
};