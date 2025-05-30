import React, { useState, useEffect } from 'react';
import ProductionOrderList from '../../components/orders/ProductionOrderList';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// Import MUI icons
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';

const ProductionOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
    orderType: 'all'
  });
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    readyToShip: 0,
    finished: 0
  });
  
  const api = useApi();
  const { showError, showSuccess } = useNotification();
  
  useEffect(() => {
    fetchOrders();
  }, [filters]);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }
      
      if (filters.orderType && filters.orderType !== 'all') {
        queryParams.append('orderType', filters.orderType);
      }
      
      const response = await api.get(`/orders/production?${queryParams.toString()}`);
      const fetchedOrders = response.data.orders || [];
      setOrders(fetchedOrders);
      
      // Calculate stats from the fetched orders and pagination total
      const totalOrders = response.data.pagination?.total || 0;
      
      // Calculate stats based on the orders array
      const calculatedStats = {
        total: totalOrders,
        processing: 0,
        completed: 0,
        readyToShip: 0,
        finished: 0
      };
      
      // Count orders by status
      fetchedOrders.forEach(order => {
        if (order.status === 'Diproses') {
          calculatedStats.processing++;
        } else if (order.status === 'Selesai Produksi') {
          calculatedStats.completed++;
        } else if (order.status === 'Siap Kirim') {
          calculatedStats.readyToShip++;
        } else if (order.status === 'Selesai') {
          calculatedStats.finished++;
        }
      });
      
      // If we're showing filtered data, make an additional request to get total counts
      if (filters.status !== 'all' || filters.search || filters.startDate || filters.endDate || filters.orderType !== 'all') {
        try {
          const allOrdersResponse = await api.get('/orders/production');
          const allOrders = allOrdersResponse.data.orders || [];
          
          // Recalculate total stats from all orders
          calculatedStats.total = allOrdersResponse.data.pagination?.total || 0;
          
          // If we're not already showing all orders, count the total by status
          if (filters.status !== 'all') {
            calculatedStats.processing = allOrders.filter(order => order.status === 'Diproses').length;
            calculatedStats.completed = allOrders.filter(order => order.status === 'Selesai Produksi').length;
            calculatedStats.readyToShip = allOrders.filter(order => order.status === 'Siap Kirim').length;
            calculatedStats.finished = allOrders.filter(order => order.status === 'Selesai').length;
          }
        } catch (error) {
          console.error('Error fetching all orders for stats:', error);
        }
      }
      
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Gagal memuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Status pesanan diubah ke ${newStatus} oleh staff produksi`
      });
      
      showSuccess(`Status pesanan berhasil diubah menjadi ${newStatus}`);
      
      // Update order status locally
      setOrders(currentOrders => 
        currentOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Refresh orders to get updated stats
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Gagal mengubah status pesanan. Silakan coba lagi.');
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      startDate: '',
      endDate: '',
      orderType: 'all'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesanan Produksi</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pesanan</p>
              <h2 className="text-2xl font-bold">{stats.total}</h2>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <ReceiptIcon className="text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Diproses</p>
              <h2 className="text-2xl font-bold">{stats.processing}</h2>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <FactoryIcon className="text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Selesai Produksi</p>
              <h2 className="text-2xl font-bold">{stats.completed}</h2>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircleIcon className="text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Siap Kirim & Selesai</p>
              <h2 className="text-2xl font-bold">{stats.readyToShip + stats.finished}</h2>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <LocalShippingIcon className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filter Pesanan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai Produksi">Selesai Produksi</option>
                <option value="Siap Kirim">Siap Kirim</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pesanan</label>
              <select
                name="orderType"
                value={filters.orderType}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Tipe</option>
                <option value="online">Online (#TEMP)</option>
                <option value="offline">Offline (#KVK)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
              <div className="flex">
                <div className="flex items-center px-3 border-l border-t border-b border-gray-300 rounded-l-md bg-gray-50">
                  <SearchIcon className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Nomor pesanan, pelanggan..."
                  className="flex-grow p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hingga Tanggal</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                label="Reset Filter"
                variant="secondary"
                icon={<RestartAltIcon fontSize="small" />}
                onClick={resetFilters}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </Card>
      
      <ProductionOrderList
        orders={orders}
        loading={loading}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default ProductionOrders;