import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardStats from '../../components/dashboard/DashboardStats';
import SalesChart from '../../components/dashboard/SalesChart';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatter';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const api = useApi();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/owner');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Gagal memuat data dashboard', 'error');
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
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    const sidebarEvent = new CustomEvent('toggle-sidebar');
    window.dispatchEvent(sidebarEvent);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
      showNotification('Data dashboard berhasil diperbarui', 'success');
    } catch (error) {
      showNotification('Gagal memperbarui data', 'error');
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500); // Memberikan efek loading minimal selama 500ms
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
          <div className="h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-200 rounded-lg"></div>
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
              Selamat {getGreeting()}, {user?.name || 'Owner'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {getCurrentDate()} | Dashboard Pemilik
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
              loading={refreshing}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>
      
      {dashboardData ? (
        <>
          <DashboardStats stats={dashboardData.stats} />
          
          <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Grafik Penjualan</h2>
            <SalesChart data={dashboardData.salesChart} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Produk Terlaris</h2>
                <Link to="/owner/reports" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center">
                  Lihat Laporan
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {dashboardData.topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-shrink-0 mr-3 sm:mr-4">
                      <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 text-sm sm:text-base font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm sm:text-base font-medium">{product.name}</h3>
                      <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                        <span>{product.totalSold} terjual</span>
                        <span>{formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Aktivitas Terbaru</h2>
              </div>
              {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start p-2 hover:bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${getActivityTypeColor(activity.type)} mr-3 mt-1`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span>{activity.user}</span>
                          <span className="mx-1">•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Tidak ada aktivitas terbaru</p>
              )}
            </div>
          </div>
          
          {/* Grid untuk Status Produksi dan Laporan Ringkas */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Kolom Status Produksi */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Status Produksi</h2>
              </div>
              <div className="space-y-3">
                {dashboardData.productionStatus && Object.entries(dashboardData.productionStatus).map(([status, count], index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                      <span className="ml-2 text-sm">{status}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
                {(!dashboardData.productionStatus || Object.keys(dashboardData.productionStatus).length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">Data status produksi tidak tersedia.</p>
                )}
              </div>
            </div>

            {/* Kolom Laporan Ringkas */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Laporan Ringkas</h2>
              </div>
              {dashboardData.summaryReport ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {
                    [
                      {
                        title: 'Rata-rata Waktu Produksi',
                        value: `${dashboardData.summaryReport.averageProductionTime} hari`,
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )
                      },
                      {
                        title: 'Persentase DP',
                        value: `${dashboardData.summaryReport.averageDpPercentage}%`,
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )
                      },
                      {
                        title: 'Produk Aktif',
                        value: `${dashboardData.summaryReport.activeProductsCount} item`,
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" /> 
                          </svg>
                        )
                      },
                      {
                        title: 'Customer Baru (Bulan Ini)',
                        value: `${dashboardData.summaryReport.newCustomersThisMonth} pelanggan`,
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )
                      },
                    ].map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                           {item.icon}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">{item.title}</p>
                          <p className="text-sm sm:text-base font-semibold">{item.value}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Data laporan ringkas tidak tersedia.</p>
              )}
            </div>
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

const getStatusColor = (status) => {
  switch (status) {
    case 'Menunggu Konfirmasi':
    case 'Pesanan Pending':
      return 'bg-blue-400';
    case 'Diproses':
    case 'Sedang Diproses':
      return 'bg-yellow-400';
    case 'Selesai Produksi':
      return 'bg-green-400';
    case 'Siap Kirim':
      return 'bg-purple-400';
    case 'Dalam Pengiriman':
      return 'bg-indigo-400';
    case 'Selesai':
      return 'bg-green-600';
    case 'Dibatalkan':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
};

const getActivityTypeColor = (type) => {
  switch (type) {
    case 'order':
      return 'bg-blue-100 text-blue-600';
    case 'payment':
      return 'bg-green-100 text-green-600';
    case 'user':
      return 'bg-purple-100 text-purple-600';
    case 'product':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'order':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    case 'payment':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'user':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'product':
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export default OwnerDashboard;