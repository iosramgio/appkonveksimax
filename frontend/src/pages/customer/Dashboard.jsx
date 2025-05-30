import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { formatDate, formatCurrency } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

const CustomerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const api = useApi();
  const { user } = useAuth();
  const { error: showError } = useNotification();
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/dashboard/customer');
        console.log("Dashboard data received:", response.data);
        setDashboardData(response.data);
        
        // Debug output untuk data total pengeluaran
        console.log("Total pengeluaran:", response.data?.stats?.totalSpent);
        
        // Debug output untuk gambar produk
        if (response.data?.recentOrders?.length > 0) {
          console.log("First order items:", response.data.recentOrders[0].items);
          console.log("First order first item image:", 
            response.data.recentOrders[0].items && 
            response.data.recentOrders[0].items.length > 0 ? 
            response.data.recentOrders[0].items[0].image : 'No items');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    const sidebarEvent = new CustomEvent('toggle-sidebar');
    window.dispatchEvent(sidebarEvent);
  };
  
  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-28 sm:h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold">Halo, {user.name}!</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Selamat datang di dashboard customer</p>
          </div>
          <div className="mt-3 sm:mt-0">
            <Link to="/products">
              <Button 
                label="Jelajahi Produk" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                }
                className="text-xs sm:text-sm"
              />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-xs sm:text-sm text-gray-500">Total Pesanan</h3>
              <p className="text-lg sm:text-2xl font-semibold">{dashboardData?.stats.totalOrders || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-xs sm:text-sm text-gray-500">Total Pengeluaran</h3>
              <p className="text-lg sm:text-2xl font-semibold">{formatCurrency(dashboardData?.stats.totalSpent || 0)}</p>
              {/* Debug output */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-400">Raw value: {dashboardData?.stats.totalSpent}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-xs sm:text-sm text-gray-500">Pesanan Aktif</h3>
              <p className="text-lg sm:text-2xl font-semibold">{dashboardData?.stats.activeOrders || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <h3 className="text-xs sm:text-sm text-gray-500">Pesanan Selesai</h3>
              <p className="text-lg sm:text-2xl font-semibold">{dashboardData?.stats.statusStats?.Selesai || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Pesanan */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Status Pesanan</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
          {Object.entries(dashboardData?.stats.statusStats || {}).map(([status, count]) => (
            <div key={status} className="bg-gray-50 p-2 sm:p-4 rounded-lg">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 ${
                  status === 'Pesanan Diterima' ? 'bg-blue-100 text-blue-600' :
                  status === 'Diproses' ? 'bg-indigo-100 text-indigo-600' :
                  status === 'Selesai Produksi' ? 'bg-orange-100 text-orange-600' :
                  status === 'Siap Kirim' ? 'bg-yellow-100 text-yellow-600' :
                  status === 'Selesai' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className="text-sm sm:text-lg font-bold">{count}</span>
                </div>
                <p className="text-xs sm:text-sm text-center">{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pembayaran yang akan jatuh tempo */}
      {dashboardData?.paymentsDueSoon?.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Pembayaran Akan Jatuh Tempo</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pesanan</th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Jatuh Tempo</th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.paymentsDueSoon.map((order) => (
                  <tr key={order._id}>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{formatDate(order.paymentDetails.remainingPayment.dueDate)}</div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{formatCurrency(order.paymentDetails.remainingPayment.amount)}</div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <Link 
                        to={`/customer/orders/${order._id}`} 
                        className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;