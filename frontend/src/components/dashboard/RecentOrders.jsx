import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatCurrency } from '../../utils/formatter';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

const RecentOrders = ({ orders, loading, onStatusChange, showStatusUpdate = false }) => {
  const { user } = useAuth();
  
  const getOrderDetailPath = (orderId) => {
    if (user) {
      switch (user.role) {
        case 'customer':
          return `/customer/orders/${orderId}`;
        case 'cashier':
          return `/cashier/orders/${orderId}`;
        case 'staff':
          return `/staff/orders/${orderId}`;
        case 'admin':
          return `/admin/orders/${orderId}`;
        case 'owner':
          return `/owner/orders/${orderId}`;
        default:
          return `/orders/${orderId}`;
      }
    }
    return `/orders/${orderId}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium mb-4">Pesanan Terbaru</h2>
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="py-3 border-b last:border-0">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 sm:w-40"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 sm:w-24"></div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 sm:w-24 ml-auto"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 sm:w-20 ml-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium mb-4">Pesanan Terbaru</h2>
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Belum ada pesanan terbaru.</p>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pesanan Diterima':
        return 'bg-blue-100 text-blue-800';
      case 'Diproses':
        return 'bg-yellow-100 text-yellow-800';
      case 'Selesai Produksi':
        return 'bg-green-100 text-green-800';
      case 'Siap Kirim':
        return 'bg-purple-100 text-purple-800';
      case 'Selesai':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    return status || 'Status Tidak Diketahui';
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'Pesanan Diterima':
        return 'Diproses';
      case 'Diproses':
        return 'Selesai Produksi';
      case 'Selesai Produksi':
        return 'Siap Kirim';
      case 'Siap Kirim':
        return 'Selesai';
      default:
        return null;
    }
  };

  const handleStatusChange = (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus && onStatusChange) {
      onStatusChange(orderId, nextStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-medium">Pesanan Terbaru</h2>
        <Link 
          to={user?.role === 'staff' ? "/staff/production" : 
              user?.role === 'cashier' ? "/cashier/orders" : 
              user?.role === 'admin' ? "/admin/orders" : 
              user?.role === 'owner' ? "/owner/orders" : 
              "/orders"}
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {orders.map((order) => (
          <div key={order._id} className="py-3 sm:py-4 group hover:bg-gray-50 transition-colors rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Link 
                  to={getOrderDetailPath(order._id)} 
                  className="font-medium text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline"
                >
                  #{order.orderNumber}
                </Link>
                <p className="text-xs sm:text-sm text-gray-600">
                  {order.customer?.name || 'Customer'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm sm:text-base">
                  {formatCurrency(order.paymentDetails.total)}
                </p>
                <div className="flex items-center space-x-2 mt-1.5">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {showStatusUpdate && getNextStatus(order.status) && (
                    <Button
                      label="Update"
                      size="xs"
                      onClick={() => handleStatusChange(order._id, order.status)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;