import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OrderList from '../../components/orders/OrderList';
import SelectField from '../../components/forms/SelectField';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const api = useApi();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const location = useLocation();
  
  // Get customer_id from URL query parameters if available
  const getCustomerIdFromURL = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('customer_id');
  };
  
  const fetchOrders = async (page = 1, status = 'all') => {
    setLoading(true);
    
    console.log('Current user:', user);
    console.log('Auth token:', sessionStorage.getItem('token'));
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', 10);
    
    if (status !== 'all') {
      queryParams.append('status', status);
    }
    
    // Check for customer_id in URL first, then fall back to current user
    const customerIdFromURL = getCustomerIdFromURL();
    if (customerIdFromURL) {
      console.log('Using customer_id from URL:', customerIdFromURL);
      queryParams.append('customer_id', customerIdFromURL);
    } else if (user && user._id) {
      console.log('Using customer_id from user object:', user._id);
      queryParams.append('customer_id', user._id);
    }
    
    try {
      const headers = {
        'x-debug-user': user?._id || 'no-user',
        'x-debug-role': user?.role || 'no-role'
      };
      
      const response = await api.get(`/orders?${queryParams.toString()}`, { headers });
      
      console.log('Orders response:', response.data);
      setOrders(response.data.orders);
      console.log("Orders.jsx - Raw orders from API:", JSON.stringify(response.data.orders, null, 2));
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('Gagal memuat daftar pesanan', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [statusFilter, user, location.search]); // Add location.search to dependencies
  
  const handlePageChange = (page) => {
    fetchOrders(page, statusFilter);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'Pesanan Diterima', label: 'Pesanan Diterima' },
    { value: 'Diproses', label: 'Diproses' },
    { value: 'Selesai Produksi', label: 'Selesai Produksi' },
    { value: 'Siap Kirim', label: 'Siap Kirim' },
    { value: 'Selesai', label: 'Selesai' }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Riwayat Pesanan</h1>
            <p className="text-gray-600">
              Lihat dan kelola semua pesanan Anda
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-grow max-w-sm">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter Pesanan
            </label>
            <div className="flex space-x-2">
              <div className="flex-grow">
                <SelectField
                  id="statusFilter"
                  name="statusFilter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  options={statusOptions}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          
          <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            Belanja Lagi
          </Link>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat riwayat pesanan...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Belum ada pesanan</h3>
            <p className="mt-1 text-gray-500">Anda belum memiliki riwayat pesanan</p>
            <div className="mt-6">
              <Link to="/products" className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                Mulai Belanja
              </Link>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            <OrderList 
              orders={orders}
              loading={loading}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;