import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout Components
import MainLayout from '../components/layout/MainLayout';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Products from '../pages/public/Products';
import ProductDetail from '../pages/public/ProductDetail';

// Auth Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Register from '../pages/auth/Register';
import GoogleCallback from '../pages/auth/GoogleCallback';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CustomerOrders from '../pages/customer/Orders';
import CustomerOrderDetail from '../pages/customer/OrderDetail';
import Checkout from '../pages/customer/Checkout';
import Profile from '../pages/customer/Profile';
import Cart from '../pages/customer/Cart';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import CreateUser from '../pages/admin/CreateUser';
import UserDetail from '../pages/admin/UserDetail';
import UserEdit from '../pages/admin/UserEdit';
import ProductManagement from '../pages/admin/ProductManagement';
import BackupRestore from '../pages/admin/BackupRestore';
import ActivityLogs from '../pages/admin/ActivityLogs';
import CreateProduct from '../pages/admin/CreateProduct';
import EditProduct from '../pages/admin/EditProduct';
import AdminProductDetail from '../pages/admin/ProductDetail';

// Cashier Pages
import CashierDashboard from '../pages/cashier/Dashboard';
import ManualOrder from '../pages/cashier/ManualOrder';
import OrderManagement from '../pages/cashier/OrderManagement';
import PaymentVerification from '../pages/cashier/PaymentVerification';
import CashierOrderDetail from '../pages/cashier/OrderDetail';

// Staff Pages
import StaffDashboard from '../pages/staff/Dashboard';
import ProductionOrders from '../pages/staff/ProductionOrders';
import StaffOrderDetail from '../pages/staff/OrderDetail';

// Owner Pages
import OwnerDashboard from '../pages/owner/Dashboard';
import Reports from '../pages/owner/Reports';

// Route Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import CashierRoute from './CashierRoute';
import StaffRoute from './StaffRoute';
import OwnerRoute from './OwnerRoute';

const AppRouter = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [appReady, setAppReady] = useState(false);
  
  // Track the last valid path for page refresh
  useEffect(() => {
    // Store the current path in sessionStorage whenever it changes
    // This will help maintain the correct page on refresh
    if (location.pathname !== '/login' && 
        location.pathname !== '/register' && 
        location.pathname !== '/forgot-password' &&
        !location.pathname.includes('/auth/google')) {
      sessionStorage.setItem('lastPath', location.pathname + location.search);
    }
  }, [location]);
  
  useEffect(() => {
    // Set app ready after auth state is loaded
    if (!isLoading) {
      setAppReady(true);
    }
  }, [isLoading]);
  
  // Show loading screen while checking auth status
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:productId" element={<ProductDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="register" element={<Register />} />
        <Route path="auth/google/callback" element={<GoogleCallback />} />
        
        {/* Customer Routes */}
        <Route path="customer" element={
          <PrivateRoute roles={['customer']} />
        }>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="orders/:orderId" element={<CustomerOrderDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="cart" element={<Cart />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="admin" element={
          <AdminRoute />
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="users/edit/:id" element={<UserEdit />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="products/:id" element={<AdminProductDetail />} />
          <Route path="backup" element={<BackupRestore />} />
          <Route path="logs" element={<ActivityLogs />} />
        </Route>
        
        {/* Cashier Routes */}
        <Route path="cashier" element={
          <CashierRoute />
        }>
          <Route path="dashboard" element={<CashierDashboard />} />
          <Route path="orders/create" element={<ManualOrder />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders/:orderId" element={<CashierOrderDetail />} />
          <Route path="payments" element={<PaymentVerification />} />
        </Route>
        
        {/* Staff Routes */}
        <Route path="staff" element={
          <StaffRoute />
        }>
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="production" element={<ProductionOrders />} />
          <Route path="orders/:orderId" element={<StaffOrderDetail />} />
        </Route>
        
        {/* Owner Routes */}
        <Route path="owner" element={
          <OwnerRoute />
        }>
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* Catch All Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
              <div>
                <h1 className="text-9xl font-extrabold text-blue-600 tracking-tight">
                  404
                </h1>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  Halaman Tidak Ditemukan
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Maaf, halaman yang Anda cari tidak dapat ditemukan.
                </p>
              </div>
              <div className="mt-8">
                <a 
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
};

export default AppRouter;