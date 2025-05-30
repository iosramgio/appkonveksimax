import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentOrders from '../../components/dashboard/RecentOrders';
import SalesChart from '../../components/dashboard/SalesChart';
import ActivityLog from '../../components/dashboard/ActivityLog';
import { useApi } from '../../hooks/useApi';
import useNotification from '../../hooks/useNotification.jsx';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const api = useApi();
  const { notify } = useNotification();
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/admin');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      notify('Gagal memuat data dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh dashboard data every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleRefresh = () => {
    fetchDashboardData();
    notify('Data dashboard berhasil diperbarui', 'success');
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    const sidebarEvent = new CustomEvent('toggle-sidebar');
    window.dispatchEvent(sidebarEvent);
  };
  
  if (loading && !dashboardData) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 sm:h-80 md:h-96 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="h-64 sm:h-72 md:h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-64 sm:h-72 md:h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Selamat {getGreeting()}, {user?.name || 'Admin'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {getCurrentDate()} | Dashboard Admin
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <Button
              label="Refresh Data"
              variant="outline"
              onClick={handleRefresh}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              }
              loading={loading}
            />
          </div>
        </div>
      </div>
      
      {dashboardData ? (
        <>
          <DashboardStats stats={dashboardData.stats} />
          
          <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Ringkasan Sistem</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="border border-blue-200 rounded-lg p-3 sm:p-4 bg-blue-50">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">Pengguna Aktif</h3>
                    <p className="text-lg sm:text-xl font-semibold">{dashboardData.stats.activeUsers || 0}</p>
                  </div>
                </div>
                <Link 
                  to="/admin/users"
                  className="mt-3 block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg text-center"
                >
                  Kelola Pengguna
                </Link>
              </div>
              
              <div className="border border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">Total Produk</h3>
                    <p className="text-lg sm:text-xl font-semibold">{dashboardData.stats.totalProducts || 0}</p>
                  </div>
                </div>
                <Link 
                  to="/admin/products"
                  className="mt-3 block w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg text-center"
                >
                  Kelola Produk
                </Link>
              </div>
              
              <div className="border border-purple-200 rounded-lg p-3 sm:p-4 bg-purple-50">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">Aktivitas Sistem</h3>
                    <p className="text-lg sm:text-xl font-semibold">{dashboardData.activityLogs?.length || 0} terbaru</p>
                  </div>
                </div>
                <Link 
                  to="/admin/activity-logs"
                  className="mt-3 block w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg text-center"
                >
                  Lihat Log Aktivitas
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Grafik Penjualan</h2>
              <SalesChart data={
                dashboardData.salesChartData?.map(item => ({
                  date: item._id,
                  dailyRevenue: item.total,
                  dailyOrderCount: item.orderCount || 0
                })) || []
              } />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <RecentOrders orders={dashboardData.recentOrders || []} />
            <ActivityLog logs={dashboardData.activityLogs || []} />
          </div>
        </>
      ) : (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Data dashboard tidak tersedia</p>
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

export default AdminDashboard;