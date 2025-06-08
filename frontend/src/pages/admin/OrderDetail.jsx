import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatDate, formatCurrency, formatOrderStatus } from '../../utils/formatter';
import { ORDERS } from '../../constants/api';
import PaymentForm from '../../components/payments/PaymentForm';

// Import MUI icons
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactoryIcon from '@mui/icons-material/Factory';
import InfoIcon from '@mui/icons-material/Info';
import PaidIcon from '@mui/icons-material/Paid';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState('full'); // 'full' or 'remaining' or 'down'
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`${ORDERS}/${orderId}`);
        if (response.data && response.data.order) {
          setOrder(response.data.order);
        } else {
          setError('Data pesanan tidak ditemukan');
          showNotification('Data pesanan tidak ditemukan', 'error');
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        if (error.response?.status === 403) {
          setError('Anda tidak memiliki akses ke pesanan ini');
          showNotification('Anda tidak memiliki akses ke pesanan ini', 'error');
          navigate('/admin/orders');
        } else if (error.response?.status === 404) {
          setError('Pesanan tidak ditemukan');
          showNotification('Pesanan tidak ditemukan', 'error');
        } else {
          setError('Gagal memuat detail pesanan');
          showNotification('Gagal memuat detail pesanan', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetail();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      // Check verification status before allowing update to "Diproses"
      if (newStatus === 'Diproses' && order.verificationStatus !== 'Diverifikasi') {
        showNotification('Pesanan harus diverifikasi terlebih dahulu sebelum diproses', 'error');
        return;
      }

      const response = await api.patch(`${ORDERS}/${orderId}/status`, { 
        status: newStatus,
        notes: `Status pesanan diubah ke ${newStatus} oleh admin`
      });
      
      if (response && response.data && response.data.order) {
        setOrder(response.data.order);
        showNotification(`Status pesanan berhasil diperbarui ke ${newStatus}`, 'success');
      } else {
        setOrder(prev => ({ ...prev, status: newStatus }));
        showNotification('Status pesanan berhasil diperbarui', 'success');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Gagal memperbarui status pesanan', 'error');
    } finally {
      setUpdatingStatus(false);
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

  const getVerificationStatusBadge = (status) => {
    switch (status) {
      case 'Belum Diverifikasi':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terverifikasi':
        return 'bg-green-100 text-green-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentStatusBadge = (order) => {
    if (order.paymentDetails.isPaid) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
          Lunas
        </span>
      );
    } else if (order.paymentDetails.downPayment?.status === 'paid') {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border border-yellow-200">
          DP Terbayar
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 border border-red-200">
          Belum Bayar
        </span>
      );
    }
  };

  const handlePayment = async (paymentData) => {
    try {
      // Log payment data for debugging
      console.log('Payment data:', paymentData);
      console.log('Order ID:', orderId);
      
      let currentDateTime = new Date().toISOString();
      let updateStatus = false;
      let updateData = {};
      
      if (paymentData.isRemainingPayment) {
        // Untuk pelunasan sisa pembayaran
        updateData = {
          status: order.status, // Tetap status yang sama
          notes: `Pelunasan sisa pembayaran sebesar ${formatCurrency(order.paymentDetails.remainingPayment.amount)} dengan metode ${paymentData.method || 'cash'}`
        };
        updateStatus = true;
        
        // Coba perbarui status pembayaran di database
        try {
          // Ubah status pembayaran sisa menjadi lunas
          await api.post(`/payments/manual`, {
            orderId: orderId,
            paymentType: 'remainingPayment',
            amount: order.paymentDetails.remainingPayment.amount,
            method: paymentData.method || 'cash',
            notes: paymentData.notes || ''
          });
          showNotification('Pembayaran sisa berhasil diproses', 'success');
        } catch (paymentError) {
          console.error('Failed to create payment record:', paymentError);
          showNotification('Gagal mencatat pembayaran sisa, tapi catatan telah ditambahkan', 'warning');
        }
      } else if (paymentData.isDownPayment) {
        // Untuk pembayaran DP
        updateData = {
          status: order.status, // Tetap status yang sama
          notes: `Pembayaran DP sebesar ${formatCurrency(order.paymentDetails.downPayment.amount)} dengan metode ${paymentData.method || 'cash'}`
        };
        updateStatus = true;
        
        // Coba perbarui status pembayaran di database
        try {
          await api.post(`/payments/manual`, {
            orderId: orderId,
            paymentType: 'downPayment',
            amount: order.paymentDetails.downPayment.amount,
            method: paymentData.method || 'cash',
            notes: paymentData.notes || ''
          });
          showNotification('Pembayaran DP berhasil diproses', 'success');
        } catch (paymentError) {
          console.error('Failed to create payment record:', paymentError);
          showNotification('Gagal mencatat pembayaran DP, tapi catatan telah ditambahkan', 'warning');
        }
      } else {
        // Untuk pembayaran penuh langsung
        updateData = {
          status: order.status, // Tetap status yang sama
          notes: `Pembayaran penuh sebesar ${formatCurrency(order.paymentDetails.total)} dengan metode ${paymentData.method || 'cash'}`
        };
        updateStatus = true;
        
        // Coba perbarui status pembayaran di database
        try {
          await api.post(`/payments/manual`, {
            orderId: orderId,
            paymentType: 'fullPayment',
            amount: order.paymentDetails.total,
            method: paymentData.method || 'cash',
            notes: paymentData.notes || ''
          });
          showNotification('Pembayaran penuh berhasil diproses', 'success');
        } catch (paymentError) {
          console.error('Failed to create payment record:', paymentError);
          showNotification('Gagal mencatat pembayaran penuh, tapi catatan telah ditambahkan', 'warning');
        }
      }
      
      if (updateStatus) {
        try {
          const response = await api.patch(`${ORDERS}/${orderId}/status`, updateData);
          
          if (response.data) {
            setShowPaymentForm(false);
            
            // Refresh order details
            const refreshResponse = await api.get(`${ORDERS}/${orderId}`);
            if (refreshResponse.data && refreshResponse.data.order) {
              setOrder(refreshResponse.data.order);
            }
          }
        } catch (statusError) {
          console.error('Failed to update order status:', statusError);
          setShowPaymentForm(false);
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      showNotification(
        error.response?.data?.message || 'Gagal memproses pembayaran',
        'error'
      );
    }
  };

  const handleRejectOrder = async () => {
    setUpdatingStatus(true);
    try {
      const response = await api.patch(`${ORDERS}/${orderId}/status`, { 
        status: 'Ditolak',
        notes: 'Pesanan ditolak oleh admin'
      });
      
      if (response && response.data && response.data.order) {
        setOrder(response.data.order);
        showNotification('Pesanan berhasil ditolak', 'success');
      } else {
        setOrder(prev => ({ ...prev, status: 'Ditolak' }));
        showNotification('Pesanan berhasil ditolak', 'success');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      showNotification('Gagal menolak pesanan', 'error');
    } finally {
      setUpdatingStatus(false);
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
        return currentStatus;
    }
  };

  const canChangeStatus = (currentStatus, nextStatus, paymentStatus) => {
    // Jika akan mengubah ke status Siap Kirim, cek apakah sudah lunas
    if (nextStatus === 'Siap Kirim' && !paymentStatus.isPaid) {
      return false;
    }
    return true;
  };

  const getButtonColorByStatus = (nextStatus) => {
    switch (nextStatus) {
      case 'Pesanan Diterima':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'Diproses':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'Selesai Produksi':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'Siap Kirim':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'Selesai':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pesanan Diterima':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
          </svg>
        );
      case 'Diproses':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case 'Selesai Produksi':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'Siap Kirim':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        );
      case 'Selesai':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link to="/admin/orders">
          <Button label="Kembali ke Daftar Pesanan" variant="outline" />
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 text-xl mb-4">Pesanan tidak ditemukan</div>
        <Link to="/admin/orders">
          <Button label="Kembali ke Daftar Pesanan" variant="outline" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with order number and buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan #{order.orderNumber}</h1>
          <p className="text-sm text-gray-600 mt-1">Dibuat pada {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            label="Kembali" 
            variant="outline"
            onClick={() => navigate('/admin/orders')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            }
          />
          {order.status !== 'Ditolak' && order.status !== 'Selesai' && (
            <div className="relative inline-block">
              <Button 
                label={`Update ke ${formatOrderStatus(getNextStatus(order.status))}`}
                isLoading={updatingStatus}
                onClick={() => handleStatusChange(getNextStatus(order.status))}
                className={`${getButtonColorByStatus(getNextStatus(order.status))} ${
                  getNextStatus(order.status) === 'Diproses' && order.verificationStatus !== 'Diverifikasi'
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                disabled={getNextStatus(order.status) === 'Diproses' && order.verificationStatus !== 'Diverifikasi'}
                icon={getStatusIcon(getNextStatus(order.status))}
              />
              {getNextStatus(order.status) === 'Diproses' && order.verificationStatus !== 'Diverifikasi' && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 transform translate-y-full w-64 px-3 py-2 bg-red-50 border border-red-100 rounded-lg shadow-lg z-10">
                  <div className="flex items-center text-xs text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Pesanan harus diverifikasi terlebih dahulu</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Reject Order Button - Only show if order is not already rejected and not completed */}
          {order.status !== 'Ditolak' && order.status !== 'Selesai' && (
            <Button
              label="Tolak Pesanan"
              variant="danger"
              onClick={handleRejectOrder}
              isLoading={updatingStatus}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              }
            />
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pesanan</h3>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
              {formatOrderStatus(order.status)}
            </span>
          </div>
        </div>
        
        {/* Verification Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status Verifikasi</h3>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusBadge(order.verificationStatus)}`}>
              {order.verificationStatus}
            </span>
          </div>
        </div>
        
        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pembayaran</h3>
          <div className="flex items-center">
            {getPaymentStatusBadge(order)}
          </div>
        </div>
        
        {/* Total Amount */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pesanan</h3>
          <p className="text-lg font-semibold text-blue-600">{formatCurrency(order.paymentDetails.total)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <InventoryIcon className="h-5 w-5 mr-2 text-blue-500" />
              Item Pesanan ({order.items.length})
            </h2>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
                  {/* First row - Product Overview */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row">
                      {/* Product Image */}
                      <div className="flex-shrink-0 md:w-1/6 mb-4 md:mb-0 md:mr-4">
                        {item.productDetails?.images?.[0]?.url ? (
                          <div className="h-24 w-24 md:h-28 md:w-28">
                            <img 
                              className="h-full w-full rounded-md object-cover border border-gray-200" 
                              src={item.productDetails?.images?.[0]?.url || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E'} 
                              alt={item.productDetails?.name || 'Product'}
                              onError={(e) => { e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                            />
                          </div>
                        ) : (
                          <div className="h-24 w-24 md:h-28 md:w-28 bg-gray-100 rounded-md flex items-center justify-center">
                            <InventoryIcon className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info - Left Column */}
                      <div className="md:w-1/3">
                        {/* Product Title and SKU */}
                        <div className="mb-3">
                          <h3 className="font-medium text-gray-900 text-lg">
                            {item.productDetails?.name}
                            {item.color ? ` - ${item.color.name}` : ''}
                          </h3>
                          
                          {/* SKU */}
                          {(item.productDetails?.sku || item.sku || item.product?.sku || '') && (
                            <p className="text-xs text-gray-500 mt-1">
                              SKU: {item.productDetails?.sku || item.sku || item.product?.sku}
                            </p>
                          )}
                          
                          {/* Custom Design Badge */}
                          {item.customDesign && (
                            <div className="text-sm text-blue-600 flex items-center mt-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Custom Design
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Product Info - Right Column */}
                      <div className="grid grid-cols-3 gap-4 md:w-1/3 mt-3 md:mt-0">
                        <div>
                          <div className="text-xs text-gray-500 font-medium">Jumlah</div>
                          <div className="font-medium mt-1">{item.quantity} pcs</div>
                        </div>
                        
                        {item.color && (
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Warna</div>
                            <div className="font-medium mt-1 flex items-center">
                              <span 
                                className="inline-block h-3 w-3 rounded-full mr-1" 
                                style={{ backgroundColor: item.color.code }}
                              ></span>
                              {item.color.name}
                            </div>
                          </div>
                        )}
                        
                        {item.material && (
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Bahan</div>
                            <div className="font-medium mt-1">{item.material.name}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-4 space-y-3">
                      {/* Item Notes */}
                      {item.notes && (
                        <div className="bg-gray-100 rounded-md p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">Catatan Item</div>
                          <p className="text-gray-700">{item.notes}</p>
                        </div>
                      )}

                      {/* Custom Design Notes */}
                      {item.customDesign && item.customDesign.notes && (
                        <div className="bg-blue-50 rounded-md p-3">
                          <div className="text-xs text-gray-500 font-medium mb-1">Catatan Desain Kustom</div>
                          <p className="text-gray-700">{item.customDesign.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Custom Design Preview if available */}
                    {item.customDesign?.isCustom && (item.customDesign?.designUrl || item.customDesign?.url) && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="text-xs text-gray-500 font-medium mb-2">Preview Desain</div>
                        <div className="flex items-center">
                          <a 
                            href={item.customDesign.designUrl || item.customDesign.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="relative group"
                          >
                            <img 
                              src={item.customDesign.designUrl || item.customDesign.url} 
                              alt="Custom Design" 
                              className="h-16 w-16 rounded object-cover border border-gray-200 transition-transform group-hover:border-blue-400 group-hover:shadow-md"
                              onError={(e) => { e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                            />
                            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center transition-opacity">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Size Breakdown Table */}
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Ukuran & Material</th>
                            <th className="px-3 py-2 text-left">Kuantitas</th>
                            <th className="px-3 py-2 text-left">Harga Satuan</th>
                            <th className="px-3 py-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {item.sizeBreakdown.map((sizeDetail, idx) => {
                            // Cari detail harga dari priceDetails.sizeDetails
                            const priceDetail = item.priceDetails && item.priceDetails.sizeDetails ? 
                              item.priceDetails.sizeDetails.find(
                                pd => pd.size === sizeDetail.size
                              ) : null;
                            
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <div>{sizeDetail.size}{sizeDetail.additionalPrice > 0 ? ` (+${formatCurrency(sizeDetail.additionalPrice)})` : ''}</div>
                                  {idx === 0 && item.material && (
                                    <div className="text-sm text-gray-500">Material: {item.material.name}</div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {sizeDetail.quantity} pcs
                                  {idx === 0 && item.priceDetails?.totalDozens > 0 && (
                                    <div className="text-xs text-gray-500">
                                      {Math.floor(item.quantity / 12)} lusin + {item.quantity % 12} pcs
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  {formatCurrency(priceDetail?.pricePerUnit || item.priceDetails?.pricePerUnit || item.unitPrice || 0)}
                                  <div className="text-xs text-gray-500">per pcs</div>
                                </td>
                                <td className="px-3 py-2 text-right font-medium">
                                  {formatCurrency(priceDetail?.subtotal || (sizeDetail.quantity * (priceDetail?.pricePerUnit || item.priceDetails?.pricePerUnit || item.unitPrice || 0)))}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Subtotal row */}
                          <tr className="bg-gray-50">
                            <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">Subtotal:</td>
                            <td className="px-3 py-2 text-right font-medium">
                              {formatCurrency(item.priceDetails.subtotal)}
                            </td>
                          </tr>

                          {/* Custom Design Fee row if applicable */}
                          {item.customDesign && item.customDesign.designFee > 0 && (
                            <tr className="bg-blue-50/30">
                              <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">
                                Biaya Desain Custom ({formatCurrency(item.customDesign.designFee)} × {item.quantity}):
                              </td>
                              <td className="px-3 py-2 text-right font-medium">
                                {formatCurrency(item.priceDetails.customDesignFee)}
                              </td>
                            </tr>
                          )}
                          
                          {/* Discount row if applicable */}
                          {item.priceDetails.discountAmount > 0 && (
                            <tr className="bg-green-50/30">
                              <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">Diskon ({item.priceDetails.discountPercentage}%):</td>
                              <td className="px-3 py-2 text-right font-medium text-green-600">
                                -{formatCurrency(item.priceDetails.discountAmount)}
                              </td>
                            </tr>
                          )}
                          
                          {/* Total row */}
                          <tr className="bg-gray-100 font-bold">
                            <td colSpan="3" className="px-3 py-2 text-left text-sm">Total:</td>
                            <td className="px-3 py-2 text-right text-blue-600">
                              {formatCurrency(item.priceDetails.total)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notes Section */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
              Catatan & Riwayat Pesanan
            </h2>
            
            {/* Order Notes */}
            {order.notes && (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mb-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1">Catatan Umum</div>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}

            {/* Status History with Notes */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <HistoryIcon fontSize="small" className="mr-1 text-gray-500" />
                  Riwayat Status
                </h3>
                <div className="space-y-3 mt-2">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(history.status)}`}>
                            {formatOrderStatus(history.status)}
                          </span>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(history.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          {/* Customer Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PersonIcon className="h-5 w-5 mr-2 text-blue-500" />
              Informasi Pelanggan
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Nama:</span>
                <span className="font-medium">{order.customer?.name || '-'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Email:</span>
                <span className="font-medium">{order.customer?.email || '-'}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Telepon:</span>
                <span className="font-medium">{order.customer?.phone || '-'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-24">Alamat:</span>
                <span className="font-medium">
                  {order.shippingAddress ? 
                    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}` :
                    order.customer?.address || '-'
                  }
                </span>
              </div>
            </div>
          </Card>
          
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ReceiptIcon className="h-5 w-5 mr-2 text-blue-500" />
              Ringkasan Pembayaran
            </h2>

            {/* Detail Ringkasan Pesanan */}
            <div className="mb-4 border-b border-gray-100 pb-4">
              <div className="text-sm font-medium mb-2">Ringkasan Pesanan:</div>
              <div className="text-sm">Total Kuantitas: {order.items.reduce((total, item) => total + item.quantity, 0)} pcs</div>
              <div className="text-sm mb-2">Harga Lusin: {Math.floor(order.items.reduce((total, item) => total + item.quantity, 0) / 12)} lusin ({Math.floor(order.items.reduce((total, item) => total + item.quantity, 0) / 12) * 12} pcs)</div>
              
              {/* Tampilkan detail item dalam bentuk tabel */}
              {order.items && order.items.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="text-sm font-medium mb-2">{item.product?.name || 'Produk'}</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Ukuran & Material</th>
                          <th className="px-3 py-2 text-left">Kuantitas</th>
                          <th className="px-3 py-2 text-left">Harga Satuan</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {item.sizeBreakdown.map((sizeDetail, idx) => {
                          // Cari detail harga dari priceDetails.sizeDetails
                          const priceDetail = item.priceDetails && item.priceDetails.sizeDetails ? 
                            item.priceDetails.sizeDetails.find(
                              pd => pd.size === sizeDetail.size
                            ) : null;
                          
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2">
                                <div>{sizeDetail.size}{sizeDetail.additionalPrice > 0 ? ` (+${formatCurrency(sizeDetail.additionalPrice)})` : ''}</div>
                                {idx === 0 && item.material && (
                                  <div className="text-sm text-gray-500">Material: {item.material.name}</div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {sizeDetail.quantity} pcs
                                {idx === 0 && item.priceDetails?.totalDozens > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {Math.floor(item.quantity / 12)} lusin + {item.quantity % 12} pcs
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {formatCurrency(priceDetail?.pricePerUnit || item.priceDetails?.pricePerUnit || item.unitPrice || 0)}
                                <div className="text-xs text-gray-500">per pcs</div>
                              </td>
                              <td className="px-3 py-2 text-right font-medium">
                                {formatCurrency(priceDetail?.subtotal || (sizeDetail.quantity * (priceDetail?.pricePerUnit || item.priceDetails?.pricePerUnit || item.unitPrice || 0)))}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Subtotal row */}
                        <tr className="bg-gray-50">
                          <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">Subtotal:</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(item.priceDetails.subtotal)}
                          </td>
                        </tr>

                        {/* Custom Design Fee row if applicable */}
                        {item.customDesign && item.customDesign.designFee > 0 && (
                          <tr className="bg-blue-50/30">
                            <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">
                              Biaya Desain Custom ({formatCurrency(item.customDesign.designFee)} × {item.quantity}):
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              {formatCurrency(item.priceDetails.customDesignFee)}
                            </td>
                          </tr>
                        )}
                        
                        {/* Discount row if applicable */}
                        {item.priceDetails.discountAmount > 0 && (
                          <tr className="bg-green-50/30">
                            <td colSpan="3" className="px-3 py-2 text-left text-sm font-medium">Diskon ({item.priceDetails.discountPercentage}%):</td>
                            <td className="px-3 py-2 text-right font-medium text-green-600">
                              -{formatCurrency(item.priceDetails.discountAmount)}
                            </td>
                          </tr>
                        )}
                        
                        {/* Total row */}
                        <tr className="bg-gray-100 font-bold">
                          <td colSpan="3" className="px-3 py-2 text-left text-sm">Total:</td>
                          <td className="px-3 py-2 text-right text-blue-600">
                            {formatCurrency(item.priceDetails.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Perhitungan */}
            <div className="space-y-3">
              {/* Subtotal - Menghitung dari total item */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Subtotal Pesanan:</span>
                <span className="font-medium">
                  {formatCurrency(
                    order.items.reduce((total, item) => total + item.priceDetails.total, 0)
                  )}
                </span>
              </div>

              {/* Custom Fees jika ada */}
              {order.paymentDetails.customFees > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Biaya Desain Custom:</span>
                  <span className="font-medium">{formatCurrency(order.paymentDetails.customFees)}</span>
                </div>
              )}

              {/* Discount jika ada */}
              {order.paymentDetails.discount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                  <span>Diskon:</span>
                  <span className="font-medium">-{formatCurrency(order.paymentDetails.discount)}</span>
                </div>
              )}

              {/* Total - Menghitung dari total item */}
              <div className="flex justify-between py-2 text-lg font-bold border-b-2 border-gray-200">
                <span>Total:</span>
                <span className="text-blue-600">
                  {formatCurrency(
                    order.items.reduce((total, item) => total + item.priceDetails.total, 0) - 
                    (order.paymentDetails.discount || 0)
                  )}
                </span>
              </div>

              {/* Informasi DP */}
              {order.paymentDetails.downPayment && (
                <div className="mt-4 space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium mb-2">Uang Muka (DP)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Persentase DP:</span>
                        <span>{order.paymentDetails.downPayment.percentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jumlah DP:</span>
                        <span className="font-medium">{formatCurrency(order.paymentDetails.downPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          order.paymentDetails.downPayment.status === 'paid' 
                            ? 'text-green-600' 
                            : order.paymentDetails.downPayment.status === 'expired'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}>
                          {order.paymentDetails.downPayment.status === 'paid' 
                            ? 'Sudah Dibayar'
                            : order.paymentDetails.downPayment.status === 'expired'
                            ? 'Kadaluarsa'
                            : 'Menunggu Pembayaran'}
                        </span>
                      </div>
                      {order.paymentDetails.downPayment.paidAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal Pembayaran:</span>
                          <span>{formatDate(order.paymentDetails.downPayment.paidAt)}</span>
                        </div>
                      )}
                      {order.paymentDetails.downPayment.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Metode Pembayaran:</span>
                          <span className="capitalize">{order.paymentDetails.downPayment.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informasi Sisa Pembayaran */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium mb-2">Sisa Pembayaran</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jumlah:</span>
                        <span className="font-medium">{formatCurrency(order.paymentDetails.remainingPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          order.paymentDetails.remainingPayment.status === 'paid' 
                            ? 'text-green-600' 
                            : order.paymentDetails.remainingPayment.status === 'expired'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}>
                          {order.paymentDetails.remainingPayment.status === 'paid' 
                            ? 'Sudah Dibayar'
                            : order.paymentDetails.remainingPayment.status === 'expired'
                            ? 'Kadaluarsa'
                            : 'Menunggu Pembayaran'}
                        </span>
                      </div>
                      {order.paymentDetails.remainingPayment.paidAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal Pembayaran:</span>
                          <span>{formatDate(order.paymentDetails.remainingPayment.paidAt)}</span>
                        </div>
                      )}
                      {order.paymentDetails.remainingPayment.paymentMethod && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Metode Pembayaran:</span>
                          <span className="capitalize">{order.paymentDetails.remainingPayment.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Pembayaran Keseluruhan */}
              <div className={`mt-4 p-3 rounded-lg ${
                order.paymentDetails.isPaid 
                  ? 'bg-green-50 border border-green-100' 
                  : 'bg-yellow-50 border border-yellow-100'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status Pembayaran:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    order.paymentDetails.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentDetails.isPaid ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
              </div>

              {/* Pesan Penolakan Pesanan */}
              {order.status === 'Ditolak' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex items-center text-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Pesanan ini telah ditolak dan tidak dapat diproses lebih lanjut.</span>
                  </div>
                </div>
              )}

              {/* Tombol Proses Pembayaran */}
              {order.status !== 'Ditolak' && 
               !order.paymentDetails.isPaid && (
                <div className="mt-4 space-y-3">
                  {/* Tombol DP */}
                  {(!order.paymentDetails.downPayment || order.paymentDetails.downPayment.status !== 'paid') && (
                    <Button
                      label="Bayar DP"
                      onClick={() => {
                        setPaymentType('down');
                        setShowPaymentForm(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      }
                    />
                  )}
                  
                  {/* Tombol Pelunasan - hanya muncul jika DP sudah dibayar */}
                  {order.paymentDetails.downPayment && 
                   order.paymentDetails.downPayment.status === 'paid' && 
                   order.paymentDetails.remainingPayment && 
                   order.paymentDetails.remainingPayment.status === 'pending' && (
                    <Button
                      label="Pelunasan"
                      onClick={() => {
                        setPaymentType('remaining');
                        setShowPaymentForm(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      }
                    />
                  )}

                  {/* Tombol Pembayaran Penuh - hanya muncul jika belum ada pembayaran DP */}
                  {(!order.paymentDetails.downPayment || order.paymentDetails.downPayment.status !== 'paid') && (
                    <Button
                      label="Bayar Lunas"
                      onClick={() => {
                        setPaymentType('full');
                        setShowPaymentForm(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      }
                    />
                  )}
                </div>
              )}

              {/* Tanggal Estimasi Selesai */}
              {order.estimatedCompletionDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimasi Selesai:</span>
                    <span className="text-blue-800">{formatDate(order.estimatedCompletionDate)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm
          order={order}
          onSubmit={handlePayment}
          onClose={() => setShowPaymentForm(false)}
          paymentType={paymentType}
          isRemainingPayment={paymentType === 'remaining'}
          isDownPayment={paymentType === 'down'}
        />
      )}
    </div>
  );
};

export default OrderDetail; 