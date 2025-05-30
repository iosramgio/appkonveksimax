import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentOrders from '../../components/dashboard/RecentOrders';
import PaymentVerificationTable from '../../components/dashboard/PaymentVerificationTable';
import Button from '../../components/common/Button';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';

const CashierDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [orderCount, setOrderCount] = useState(0);
  const { user } = useAuth();
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/cashier');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Gagal memuat data dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrderCount = async () => {
    try {
      // Get all orders count without any filter
      const response = await api.get('/orders?limit=1');
      if (response.data && response.data.pagination) {
        setOrderCount(response.data.pagination.total || 0);
      }
    } catch (error) {
      console.error('Error fetching order count:', error);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    fetchOrderCount();
    
    // Refresh dashboard data every 5 minutes
    const intervalId = setInterval(() => {
      fetchDashboardData();
      fetchOrderCount();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    // Update dashboard stats with the correct order count when orderCount changes
    if (dashboardData && orderCount > 0) {
      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalOrders: orderCount
        }
      }));
    }
  }, [orderCount]);

  const handlePaymentVerified = (paymentId, status, updatedOrder) => {
    if (!dashboardData) return;
    
    // Update pendingVerifications list
    const updatedVerifications = dashboardData.pendingVerifications.filter(
      payment => payment._id !== paymentId
    );
    
    // Update dashboard data
    setDashboardData({
      ...dashboardData,
      pendingVerifications: updatedVerifications,
      // Update recentOrders if the verified order is in the list
      recentOrders: dashboardData.recentOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      )
    });
    
    showNotification(`Pembayaran berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`, 'success');
  };
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    const sidebarEvent = new CustomEvent('toggle-sidebar');
    window.dispatchEvent(sidebarEvent);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchOrderCount()
      ]);
      showNotification('Data dashboard berhasil diperbarui', 'success');
    } catch (error) {
      showNotification('Gagal memperbarui data', 'error');
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500); // Memberikan efek loading minimal selama 500ms
    }
  };
  
  const getFilteredPayments = () => {
    if (!dashboardData?.pendingVerifications) return [];
    
    switch (activeFilter) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        return dashboardData.pendingVerifications.filter(payment => 
          payment.createdAt.startsWith(today)
        );
      case 'all':
      default:
        return dashboardData.pendingVerifications;
    }
  };
  
  // Loading skeleton untuk initial load
  if (loading && !dashboardData) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          {/* Header skeleton */}
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-28 sm:h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          
          {/* Task summary skeleton */}
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          
          {/* Payment verification skeleton */}
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          
          {/* Recent orders skeleton */}
          <div className="h-64 sm:h-80 md:h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-4 md:p-6 relative">
      {/* Loading overlay */}
      {refreshing && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-600 font-medium">Memperbarui Data...</p>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Selamat {getGreeting()}, {user?.name || 'Kasir'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {getCurrentDate()} | Dashboard Kasir
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              label="Refresh Data" 
              variant="outline"
              onClick={handleRefresh}
              loading={refreshing}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              }
              className="text-xs sm:text-sm shadow-sm"
            />
            <Link to="/cashier/orders/create">
              <Button 
                label="Buat Pesanan Baru" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                }
                className="text-xs sm:text-sm shadow-sm"
              />
            </Link>
          </div>
        </div>
      </div>
      
      {dashboardData ? (
        <>
          {/* Stats Cards */}
          <DashboardStats stats={{
            ...dashboardData.stats,
            totalOrders: orderCount || dashboardData.stats.totalOrders
          }} />
          
          {/* Task Summary */}
          {dashboardData.pendingVerifications && dashboardData.pendingVerifications.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ringkasan Tugas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="border border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
                      <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900">Verifikasi Pembayaran</h3>
                      <p className="text-lg sm:text-xl font-semibold">{dashboardData.pendingVerifications.length}</p>
                    </div>
                  </div>
                  <Link to="/cashier/payments">
                    <button 
                      className="mt-3 w-full py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg"
                    >
                      Lihat Semua
                    </button>
                  </Link>
                </div>
                
                <div className="border border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
                      <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900">Pesanan Hari Ini</h3>
                      <p className="text-lg sm:text-xl font-semibold">{dashboardData.stats.todayOrders || 0}</p>
                    </div>
                  </div>
                  <Link to="/cashier/orders">
                    <button 
                      className="mt-3 w-full py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg"
                    >
                      Kelola Pesanan
                    </button>
                  </Link>
                </div>
                
                <div className="border border-yellow-200 rounded-lg p-3 sm:p-4 bg-yellow-50">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900">Pembayaran Hari Ini</h3>
                      <p className="text-lg sm:text-xl font-semibold">{dashboardData.stats.todayPayments || 0}</p>
                    </div>
                  </div>
                  <Link to="/cashier/payments">
                    <button 
                      className="mt-3 w-full py-1.5 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm font-medium rounded-lg"
                    >
                      Riwayat Pembayaran
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Verification Section */}
          {dashboardData.pendingVerifications && dashboardData.pendingVerifications.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 sm:p-6 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    <h2 className="text-base sm:text-lg font-semibold">Verifikasi Pembayaran</h2>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md ${
                          activeFilter === 'all' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => setActiveFilter('all')}
                      >
                        Semua
                      </button>
                      <button
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md ${
                          activeFilter === 'today' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => setActiveFilter('today')}
                      >
                        Hari Ini
                      </button>
                    </div>
                  </div>
                </div>
                <PaymentVerificationTable 
                  payments={getFilteredPayments()}
                  onPaymentVerified={handlePaymentVerified}
                />
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
              <RecentOrders orders={dashboardData.recentOrders} />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 text-gray-500 mb-3 sm:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Data Tidak Tersedia</h3>
          <p className="text-xs sm:text-sm text-gray-500">Mohon maaf, data dashboard tidak dapat dimuat saat ini.</p>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Pagi';
  if (hour < 15) return 'Siang';
  if (hour < 19) return 'Sore';
  return 'Malam';
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default CashierDashboard;