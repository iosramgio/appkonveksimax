import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductionStats from '../../components/dashboard/ProductionStats';
import ProductionOrderList from '../../components/orders/ProductionOrderList';
import { useApi } from '../../hooks/useApi';
import useNotification from '../../hooks/useNotification.jsx';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { FiBox, FiCheckSquare, FiList, FiActivity } from 'react-icons/fi';

// Komponen Kartu Statistik Sederhana
const StatCard = ({ title, value, icon, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {icon && <div className="text-blue-500 text-2xl">{icon}</div>}
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
  </div>
);

const StaffDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();
  
  const api = useApi();
  const { notify } = useNotification();
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/staff?includeAll=true');
      console.log('Staff Dashboard API Response:', response.data);
      setDashboardData(response.data);
      
      // Tambahkan logging untuk melihat tipe pesanan
      if (response.data.orders && response.data.orders.length > 0) {
        const onlineOrders = response.data.orders.filter(o => !o.isOfflineOrder).length;
        const offlineOrders = response.data.orders.filter(o => o.isOfflineOrder).length;
        console.log(`Orders breakdown - Online: ${onlineOrders}, Offline: ${offlineOrders}, Total: ${response.data.orders.length}`);
      }
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      if (response && response.data && response.data.order) {
        // Update with order from response
        setDashboardData(prevData => ({
          ...prevData,
          orders: prevData.orders.map(order => 
            order._id === orderId ? response.data.order : order
          ),
          stats: {
            ...prevData.stats,
            completedOrders: newStatus === 'Selesai Produksi' 
              ? prevData.stats.completedOrders + 1 
              : prevData.stats.completedOrders,
            inProgressOrders: newStatus === 'Selesai Produksi'
              ? prevData.stats.inProgressOrders - 1
              : prevData.stats.inProgressOrders
          }
        }));
      } else {
        // Fallback to local update
        setDashboardData(prevData => ({
          ...prevData,
          orders: prevData.orders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          ),
          stats: {
            ...prevData.stats,
            completedOrders: newStatus === 'Selesai Produksi' 
              ? prevData.stats.completedOrders + 1 
              : prevData.stats.completedOrders,
            inProgressOrders: newStatus === 'Selesai Produksi'
              ? prevData.stats.inProgressOrders - 1
              : prevData.stats.inProgressOrders
          }
        }));
      }
      
      notify(`Status pesanan berhasil diperbarui menjadi ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      notify('Gagal memperbarui status pesanan', 'error');
    }
  };
  
  const handleRefresh = () => {
    fetchDashboardData();
    notify('Data dashboard berhasil diperbarui', 'success');
  };
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    const sidebarEvent = new CustomEvent('toggle-sidebar');
    window.dispatchEvent(sidebarEvent);
  };
  
  const getFilteredOrders = () => {
    if (!dashboardData?.orders) return [];
    
    switch (activeFilter) {
      case 'diproses':
        return dashboardData.orders.filter(order => order.status === 'Diproses');
      case 'selesai-produksi':
        return dashboardData.orders.filter(order => order.status === 'Selesai Produksi');
      case 'siap-kirim':
        return dashboardData.orders.filter(order => order.status === 'Siap Kirim');
      case 'pending-payment':
        return dashboardData.orders.filter(order => 
          !order.paymentDetails?.isPaid && 
          ['Diproses', 'Selesai Produksi'].includes(order.status)
        );
      case 'all':
      default:
        return dashboardData.orders.filter(order => 
          ['Diproses', 'Selesai Produksi', 'Siap Kirim'].includes(order.status)
        );
    }
  };
  
  if (loading && !dashboardData) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-28 sm:h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 sm:h-80 md:h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Selamat {getGreeting()}, {user?.name || 'Staff'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {getCurrentDate()} | Dashboard Produksi
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <Button
              label="Refresh Data"
              variant="outline"
              onClick={handleRefresh}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              }
              loading={loading}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {dashboardData?.stats && console.log('Rendering stats object:', dashboardData.stats)}
      
      {dashboardData ? (
        <>
          <ProductionStats stats={dashboardData.stats} />
          
          <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ringkasan Tugas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="border border-yellow-200 rounded-lg p-3 sm:p-4 bg-yellow-50">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">Pesanan Diproses</h3>
                    <p className="text-lg sm:text-xl font-semibold">{
                      dashboardData.orders.filter(order => order.status === 'Diproses').length
                    }</p>
                  </div>
                </div>
                <button 
                  className="mt-3 w-full py-1.5 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm font-medium rounded-lg"
                  onClick={() => setActiveFilter('diproses')}
                >
                  Lihat Pesanan
                </button>
              </div>
              
              <div className="border border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">Selesai Produksi</h3>
                    <p className="text-lg sm:text-xl font-semibold">{
                      dashboardData.orders.filter(order => order.status === 'Selesai Produksi').length
                    }</p>
                  </div>
                </div>
                <button 
                  className="mt-3 w-full py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg"
                  onClick={() => setActiveFilter('selesai-produksi')}
                >
                  Lihat Pesanan
                </button>
              </div>
              
              <div className="border border-purple-200 rounded-lg p-3 sm:p-4 bg-purple-50">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900">Siap Kirim</h3>
                    <p className="text-lg sm:text-xl font-semibold">{
                      dashboardData.orders.filter(order => order.status === 'Siap Kirim').length
                    }</p>
                  </div>
                </div>
                <button 
                  className="mt-3 w-full py-1.5 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium rounded-lg"
                  onClick={() => setActiveFilter('siap-kirim')}
                >
                  Lihat Pesanan
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <h2 className="text-base sm:text-lg font-semibold">Daftar Pesanan</h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md ${
                        activeFilter === 'all' 
                          ? 'bg-[#620000] text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveFilter('all')}
                    >
                      Semua
                    </button>
                    <button
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md ${
                        activeFilter === 'diproses' 
                          ? 'bg-[#620000] text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveFilter('diproses')}
                    >
                      Diproses
                    </button>
                    <button
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md ${
                        activeFilter === 'selesai-produksi' 
                          ? 'bg-[#620000] text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveFilter('selesai-produksi')}
                    >
                      Selesai Produksi
                    </button>
                    <button
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-md ${
                        activeFilter === 'pending-payment' 
                          ? 'bg-[#620000] text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setActiveFilter('pending-payment')}
                    >
                      Menunggu Pembayaran
                    </button>
                  </div>
                </div>
              </div>
              <ProductionOrderList 
                orders={getFilteredOrders()} 
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Data dashboard tidak tersedia</p>
        </div>
      )}

      {/* Bagian Statistik */}
      {/* Placeholder untuk fungsionalitas tambahan staf */}
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

export default StaffDashboard;