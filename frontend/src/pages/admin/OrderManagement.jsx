import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrderList from '../../components/orders/OrderList';
import Button from '../../components/common/Button';
import SelectField from '../../components/forms/SelectField';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS, FILTER_ALL_OPTION } from '../../constants/options';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', 10);
    
    if (searchQuery) {
      queryParams.append('search', searchQuery);
    }
    
    if (statusFilter !== 'all') {
      queryParams.append('status', statusFilter);
    }
    
    if (paymentFilter !== 'all') {
      queryParams.append('paymentStatus', paymentFilter);
    }
    
    if (dateFilter !== 'all') {
      const today = new Date();
      let startDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        default:
          break;
      }
      
      queryParams.append('startDate', startDate.toISOString());
      queryParams.append('endDate', today.toISOString());
    }
    
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    
    try {
      const response = await api.get(`/orders?${queryParams.toString()}`);
      setOrders(response.data.orders);
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
    fetchOrders(1);
  }, [statusFilter, paymentFilter, dateFilter, sortBy, sortOrder, searchQuery]);
  
  const handlePageChange = (page) => {
    fetchOrders(page);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePaymentFilterChange = (e) => {
    setPaymentFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };
  
  const statusOptions = [FILTER_ALL_OPTION, ...ORDER_STATUS_OPTIONS];
  const paymentOptions = [FILTER_ALL_OPTION, ...PAYMENT_STATUS_OPTIONS];
  
  const dateOptions = [
    { value: 'all', label: 'Semua Waktu' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: '7 Hari Terakhir' },
    { value: 'month', label: '30 Hari Terakhir' }
  ];
  
  const sortOptions = [
    { value: 'createdAt-desc', label: 'Terbaru' },
    { value: 'createdAt-asc', label: 'Terlama' },
    { value: 'paymentDetails.total-asc', label: 'Total Terendah' },
    { value: 'paymentDetails.total-desc', label: 'Total Tertinggi' }
  ];
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manajemen Pesanan</h1>
        <div className="flex space-x-2">
          <Button 
            variant="secondary"
            onClick={() => fetchOrders(currentPage)}
            isLoading={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            }
          >
            Refresh
          </Button>
          <Link to="/admin/orders/create">
            <Button 
              variant="primary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
            >
              Buat Pesanan Baru
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Pesanan
            </label>
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari nomor pesanan atau nama pelanggan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cari
              </button>
            </div>
          </div>
          
          <SelectField
            label="Filter Status Pesanan"
            name="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
          />
          
          <SelectField
            label="Filter Status Pembayaran"
            name="paymentFilter"
            value={paymentFilter}
            onChange={handlePaymentFilterChange}
            options={paymentOptions}
          />
          
          <SelectField
            label="Filter Tanggal"
            name="dateFilter"
            value={dateFilter}
            onChange={handleDateFilterChange}
            options={dateOptions}
          />
          
          <SelectField
            label="Urutkan"
            name="sortBy"
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            options={sortOptions}
          />
        </form>
      </div>
      
      <OrderList 
        orders={orders}
        loading={loading}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
};

export default OrderManagement; 