import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../common/Pagination';
import { formatDate, formatCurrency } from '../../utils/formatter';
import { usePermission } from '../../hooks/usePermission';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { calculatePricePerUnit, calculateDetailSubtotal, calculateCustomDesignFee } from '../../utils/pricingCalculator';
import OrderItemCard from './OrderItemCard';

const OrderList = ({ orders = [], loading, onStatusChange, onPageChange, totalPages, currentPage }) => {
  console.log("OrderList.jsx - Received orders prop (awal komponen):", JSON.stringify(orders, null, 2));
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const { hasPermission } = usePermission();
  const { user } = useAuth();
  const api = useApi();
  const { success: showSuccess, error: showError } = useNotification();
  
  const canChangeStatus = hasPermission(['admin', 'cashier', 'staff']);
  const isCustomer = user?.role === 'customer';
  
  // Filter orders based on current user
  useEffect(() => {
    console.log("OrderList useEffect - orders length:", orders?.length);
    console.log("OrderList useEffect - user:", user);
    
    if (orders && orders.length > 0) {
      // For customers, the API should already filter orders, but we'll double-check
      if (isCustomer && user?._id) {
        console.log("Customer filtering - checking orders for user:", user._id);
        
        // Filter orders to only show orders from the current user
        const userOrders = orders.filter(order => {
          // Handle case where customer might be an object or just an ID string
          if (!order.customer) {
            console.log("Order missing customer field:", order._id);
            return false;
          }
          
          const customerId = typeof order.customer === 'object' 
            ? order.customer._id 
            : order.customer;
            
          const userId = user._id;
          
          console.log(`Comparing order customer ${customerId} with user ${userId}`);
          return customerId === userId || customerId.toString() === userId.toString();
        });
        
        console.log(`Filtered ${orders.length} orders to ${userOrders.length} for user ${user._id}`);
        setFilteredOrders(userOrders);
      } else {
        // If not a customer or no user ID, show all orders
        setFilteredOrders(orders);
      }
    } else {
      // If no orders, set filtered orders to empty array
      setFilteredOrders([]);
    }
  }, [orders, user, isCustomer]);
  
  const toggleExpandOrder = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pesanan Diterima':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Diproses':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Selesai Produksi':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Siap Kirim':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Selesai':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'Ditolak':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pesanan Diterima':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Diproses':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'Selesai Produksi':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Siap Kirim':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        );
      case 'Selesai':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Ditolak':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
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

  const getPaymentStatus = (order) => {
    if (order.paymentDetails.isPaid) {
      return 'Lunas';
    } else if (order.paymentDetails.downPayment.status === 'paid') {
      return 'DP';
    } else {
      return 'Belum Bayar';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'Lunas':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'DP':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Belum Bayar':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };
  
  const getVerificationBadgeClass = (status) => {
    switch (status) {
      case 'Diverifikasi':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Ditolak':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  const getVerificationText = (status) => {
    switch (status) {
      case 'Diverifikasi':
        return 'Pesanan Sudah Diverifikasi';
      case 'Ditolak':
        return 'Pesanan Ditolak';
      default:
        return 'Menunggu Verifikasi';
    }
  };
  
  // Replace or add this function to render order items
  const renderOrderItem = (item) => {
    return <OrderItemCard item={item} compact={true} />;
  };
  
  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-gray-600">Memuat data pesanan...</p>
        </div>
      )}
      
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">Belum ada pesanan</h3>
          <p className="text-gray-500 mt-2">Tidak ada data pesanan yang dapat ditampilkan saat ini</p>
        </div>
      )}

      {!loading && filteredOrders.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const paymentStatus = getPaymentStatus(order);
              console.log(`OrderList.jsx (dalam map) - Order ID: ${order._id}, Order Number: ${order.orderNumber}, totalAmount: ${order.totalAmount}, paymentDetails.total: ${order.paymentDetails?.total}`);
              
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  {/* Card Header */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      {/* Order Info */}
                      <div className="mb-4 sm:mb-0">
                        <div>
                          <Link
                            to={isCustomer ? `/customer/orders/${order._id}` : `/cashier/orders/${order._id}`}
                            className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            Pesanan #{order.orderNumber}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(order.createdAt)}
                            </span>
                            
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              {order.items.length} item
                            </span>
                            
                            {/* Toggle Details Button */}
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                toggleExpandOrder(order._id);
                              }}
                              className="flex items-center text-blue-500 hover:text-blue-700"
                            >
                              <span>{isExpanded ? 'Sembunyikan Detail' : 'Lihat Detail'}</span>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Order Status and Payment Status */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusClass(paymentStatus)}`}>
                            {paymentStatus}
                          </span>
                        </div>
                      </div>
                      
                      {/* Price and Actions */}
                      <div className="flex flex-col items-end">
                        <div className="text-lg font-bold text-gray-800">
                          {formatCurrency(order.paymentDetails?.total || 0)}
                        </div>
                        
                        <div className="flex items-center mt-3">
                          {!order.paymentDetails.isPaid && (
                            <Link
                              to={isCustomer ? `/customer/orders/${order._id}` : `/cashier/orders/${order._id}`}
                              className="mr-2 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              {order.paymentDetails.downPayment?.status === 'paid' ? 'Lunasi Pembayaran' : 'Proses Pembayaran'}
                            </Link>
                          )}
                          
                          {/* Detail Button */}
                          <Link
                            to={isCustomer ? `/customer/orders/${order._id}` : `/cashier/orders/${order._id}`}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Lihat Detail Lengkap
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items Preview */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                      <div className="mt-2 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Detail Produk</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-start">
                                {/* Product Image */}
                                <div className="flex-shrink-0 mr-3">
                                  {/* Try to get image from productDetails first, then from product */}
                                  {(item.productDetails && item.productDetails.images && item.productDetails.images.length > 0) ? (
                                    <img 
                                      src={item.productDetails.images[0].url} 
                                      alt={item.productDetails.name || "Produk"} 
                                      className="w-20 h-20 object-cover rounded-md"
                                      onError={(e) => { 
                                        e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                      }}
                                    />
                                  ) : (item.product && item.product.images && item.product.images.length > 0) ? (
                                    <img 
                                      src={typeof item.product.images[0] === 'object' ? item.product.images[0].url : item.product.images[0]} 
                                      alt={item.product.name || "Produk"} 
                                      className="w-20 h-20 object-cover rounded-md"
                                      onError={(e) => { 
                                        e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <h5 className="font-medium text-sm">
                                        {item.productDetails?.name || (item.product && typeof item.product === 'object' ? item.product.name : 'Produk')}
                                      </h5>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {item.quantity} pcs × {formatCurrency(item.unitPrice)}
                                      </div>
                                      {/* Show discount if available */}
                                      {item.product && item.product.discount && item.product.discount > 0 && (
                                        <div className="text-xs text-green-600 mt-0.5">
                                          Diskon {item.product.discount}% 
                                          <span className="ml-1">
                                            ({formatCurrency(Math.round(item.unitPrice * item.product.discount / 100))}/pcs)
                                          </span>
                                        </div>
                                      )}
                                      
                                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                                        {/* Color */}
                                        {item.color && (
                                          <div className="flex items-center text-xs">
                                            <span className="text-gray-500 mr-1">Warna:</span>
                                            <span className="font-medium flex items-center">
                                              {item.color.code && (
                                                <span
                                                  className="w-3 h-3 rounded-full mr-1"
                                                  style={{ backgroundColor: item.color.code }}
                                                ></span>
                                              )}
                                              {item.color.name}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {/* Material */}
                                        {item.material && (
                                          <div className="flex items-center text-xs">
                                            <span className="text-gray-500 mr-1">Bahan:</span>
                                            <span className="font-medium">{item.material.name}</span>
                                            {item.material.additionalPrice > 0 && (
                                              <span className="text-blue-600 ml-1">
                                                (+{formatCurrency(item.material.additionalPrice)})
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Size Breakdown */}
                                      {item.sizeBreakdown && item.sizeBreakdown.length > 0 && (
                                        <div className="mt-2">
                                          <div className="text-xs text-gray-500 mb-1">Ukuran:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {item.sizeBreakdown.map((size, sizeIdx) => (
                                              <span 
                                                key={sizeIdx} 
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                                              >
                                                {size.size}: {size.quantity} pcs
                                                {size.additionalPrice > 0 && (
                                                  <span className="ml-0.5 text-blue-600">
                                                    (+{formatCurrency(size.additionalPrice)})
                                                  </span>
                                                )}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-sm font-medium">
                                      {formatCurrency(item.priceDetails?.total || (item.unitPrice * item.quantity))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Custom Design Section */}
                              {item.customDesign && item.customDesign.isCustom && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center text-xs text-blue-600 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Custom Design</span>
                                    {item.customDesign.designFee > 0 && (
                                      <span className="ml-1">
                                        (+{formatCurrency(item.customDesign.designFee)})
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap items-start gap-3">
                                    {/* Custom Design Image */}
                                    {item.customDesign.designUrl && (
                                      <div className="flex-shrink-0">
                                        <img 
                                          src={item.customDesign.designUrl} 
                                          alt="Custom Design" 
                                          className="h-24 w-auto max-w-[120px] object-contain border border-gray-200 rounded-md bg-white p-1"
                                          onError={(e) => { 
                                            e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                          }}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Custom Design Notes */}
                                    {item.customDesign.notes && (
                                      <div className="flex-1 text-xs text-gray-600">
                                        <div className="font-medium text-gray-700 mb-1">Catatan Desain:</div>
                                        <p className="italic bg-white p-2 rounded-md border border-gray-100">
                                          "{item.customDesign.notes}"
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Order Summary */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Metode Pengiriman:</span>
                            <span className="text-sm">{order.deliveryMethod || 'Ambil Sendiri'}</span>
                          </div>
                          {order.shippingAddress && (
                            <div className="flex justify-between items-start mt-2">
                              <span className="text-sm font-medium text-gray-600">Alamat Pengiriman:</span>
                              <span className="text-sm text-right ml-2">
                                {order.shippingAddress.street}, 
                                {order.shippingAddress.city && ` ${order.shippingAddress.city},`} 
                                {order.shippingAddress.province && ` ${order.shippingAddress.province}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* View Detail Link */}
                        <div className="mt-4 text-center">
                          <Link
                            to={isCustomer ? `/customer/orders/${order._id}` : `/cashier/orders/${order._id}`}
                            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Detail Pesanan Lengkap
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={onPageChange} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderList;