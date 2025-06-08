import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { formatDate, formatCurrency, formatOrderStatus } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { ORDERS } from '../../constants/api';
import PaymentForm from '../../components/payments/PaymentForm';

// Importar iconos necesarios
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
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  
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
          navigate('/staff/production');
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

  const getNextStatus = (currentStatus) => {
    // Staff hanya bisa mengubah status produksi
    switch (currentStatus) {
      case 'Diproses':
        return 'Selesai Produksi';
      case 'Selesai Produksi':
        return 'Siap Kirim'; // Selalu kembalikan Siap Kirim
      default:
        return null;
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      // Validasi status yang diperbolehkan untuk staff
      if (!['Selesai Produksi', 'Siap Kirim'].includes(newStatus)) {
        showNotification('Anda tidak memiliki izin untuk mengubah ke status ini', 'error');
        return;
      }

      // Jika status Siap Kirim, cek apakah pembayaran sudah lunas
      if (newStatus === 'Siap Kirim' && !order.paymentDetails.isPaid) {
        showNotification('Pesanan harus lunas sebelum status dapat diubah menjadi Siap Kirim', 'error');
        return;
      }

      const response = await api.patch(`${ORDERS}/${orderId}/status`, {
        status: newStatus,
        notes: `Status diubah ke ${formatOrderStatus(newStatus)} oleh staff produksi`
      });
      
      if (response.data && response.data.order) {
        setOrder(response.data.order);
        showNotification(`Status pesanan berhasil diubah menjadi ${formatOrderStatus(newStatus)}`, 'success');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Gagal mengubah status pesanan', 'error');
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
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        );
      case 'Diproses':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'Selesai Produksi':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'Siap Kirim':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
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

  const getPaymentStatusBadge = (order) => {
    if (order.paymentDetails.isPaid) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
          Lunas
        </span>
      );
    } else if (order.paymentDetails.downPayment.status === 'paid') {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-red-500 text-xl mb-4">{error || 'Pesanan tidak ditemukan'}</div>
          <Link to="/staff/production">
            <Button label="Kembali ke Daftar Pesanan" variant="outline" icon={<ArrowBackIcon fontSize="small" />} />
          </Link>
        </div>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with action buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan #{order.orderNumber}</h1>
          <p className="text-sm text-gray-600 mt-1">Dibuat pada {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/staff/production">
            <Button 
              label="Kembali" 
              variant="outline"
              icon={<ArrowBackIcon fontSize="small" />}
            />
          </Link>
          {nextStatus && (
            <div className="relative inline-block">
              <Button 
                label={`Update ke ${formatOrderStatus(nextStatus)}`}
                isLoading={updatingStatus}
                onClick={() => handleUpdateStatus(nextStatus)}
                className={`${getButtonColorByStatus(nextStatus)} ${
                  nextStatus === 'Siap Kirim' && !order.paymentDetails.isPaid 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                disabled={nextStatus === 'Siap Kirim' && !order.paymentDetails.isPaid}
                icon={getStatusIcon(nextStatus)}
              />
              {nextStatus === 'Siap Kirim' && !order.paymentDetails.isPaid && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 transform translate-y-full w-64 px-3 py-2 bg-red-50 border border-red-100 rounded-lg shadow-lg z-10">
                  <div className="flex items-center text-xs text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Pembayaran harus lunas</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pesanan</h3>
          <div className="flex flex-col">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusBadgeClass(order.status)} mb-2`}>
              {formatOrderStatus(order.status)}
            </span>
            {order.status === 'Diproses' && (
              <div className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Oleh Staff Produksi</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pembayaran</h3>
          <div className="flex items-center">
            {getPaymentStatusBadge(order)}
          </div>
        </div>
        
        {/* Estimated Completion */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Estimasi Selesai</h3>
          <p className="text-lg font-semibold text-gray-800">
            {order.estimatedCompletionDate ? (
              <>
                {formatDate(order.estimatedCompletionDate)}
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  {(() => {
                    const today = new Date();
                    const estimatedDate = new Date(order.estimatedCompletionDate);
                    const diffTime = Math.ceil((estimatedDate - today) / (1000 * 60 * 60 * 24));
                    return diffTime > 0 
                      ? `${diffTime} hari lagi` 
                      : diffTime === 0 
                        ? "Hari ini" 
                        : `Terlambat ${Math.abs(diffTime)} hari`;
                  })()}
                </span>
              </>
            ) : 'Tidak tersedia'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Item Pesanan ({order.items.length})
            </h2>
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                >
                  {/* First row - Product Overview */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row">
                      {/* Product Image */}
                      <div className="flex-shrink-0 md:w-1/6 mb-4 md:mb-0 md:mr-4">
                        {item.productDetails?.images?.[0]?.url ? (
                          <div className="h-24 w-24 md:h-28 md:w-28">
                            <img 
                              className="h-full w-full rounded-md object-cover border border-gray-200" 
                              src={item.productDetails.images[0].url} 
                              alt={item.productDetails.name}
                              onError={(e) => { e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                            />
                          </div>
                        ) : (
                          <div className="h-24 w-24 md:h-28 md:w-28 bg-gray-100 rounded-md flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info - Left Column */}
                      <div className="md:w-1/3">
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
                    </div>
                    
                    {/* Custom Design Preview if available */}
                    {item.customDesign?.isCustom && item.customDesign?.designUrl && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="text-xs text-gray-500 font-medium mb-2">Preview Desain</div>
                            <div className="flex items-center">
                              <a 
                                href={item.customDesign.designUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="relative group"
                              >
                                <img 
                                  src={item.customDesign.designUrl} 
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
                          
                          {/* Custom Design Notes */}
                          {item.customDesign && item.customDesign.notes && (
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 font-medium mb-2">Catatan Desain Custom</div>
                              <div className="bg-blue-50 rounded-md p-3">
                                <p className="text-gray-700">{item.customDesign.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Second row - Size Breakdown Table */}
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukuran</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {item.sizeBreakdown.map((sizeDetail, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-3 font-medium">{sizeDetail.size}</td>
                              <td className="px-3 py-3 text-center">{sizeDetail.quantity} pcs</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Catatan Pesanan
            </h2>
            
            {/* Order Notes */}
            {order.notes && (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mb-4">
                <div className="text-xs text-gray-500 uppercase font-medium mb-1">Catatan Umum</div>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Riwayat Status</h3>
                <div className="space-y-3">
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
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Informasi Pelanggan
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Nama:</span>
                <span className="font-medium">{order.customer.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Email:</span>
                <span className="font-medium">{order.customer.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 w-24">Telepon:</span>
                <span className="font-medium">{order.customer.phone || '-'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-24">Alamat:</span>
                <span className="font-medium">
                  {order.shippingAddress ? 
                    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}` :
                    order.customer.address || '-'
                  }
                </span>
              </div>
            </div>
          </div>
          
          {/* Order Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Informasi Pesanan
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Nomor Pesanan:</span>
                <span className="font-medium">#{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tanggal Pesanan:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              
              {order.estimatedCompletionDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estimasi Selesai:</span>
                  <span>{formatDate(order.estimatedCompletionDate)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tipe Pesanan:</span>
                <span className={order.isOfflineOrder ? 'text-purple-600 font-medium' : 'text-blue-600 font-medium'}>
                  {order.isOfflineOrder ? 'Offline' : 'Online'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Jumlah Item:</span>
                <span>{order.items.reduce((acc, item) => acc + item.quantity, 0)} pcs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 