import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatDate } from '../../utils/formatter';

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
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const api = useApi();
  const { showError, showSuccess } = useNotification();
  
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        if (response.data && response.data.order) {
          setOrder(response.data.order);
        } else {
          setError('Data pesanan tidak ditemukan');
          showError('Data pesanan tidak ditemukan');
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        setError('Gagal memuat detail pesanan');
        showError('Gagal memuat detail pesanan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetail();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { 
        status: newStatus,
        notes: `Status pesanan diubah ke ${newStatus} oleh staff produksi`
      });
      
      if (response && response.data && response.data.order) {
        setOrder(response.data.order);
        showSuccess(`Status pesanan berhasil diperbarui ke ${newStatus}`);
      } else {
        setOrder(prev => ({ ...prev, status: newStatus }));
        showSuccess('Status pesanan berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Gagal memperbarui status pesanan');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Diproses':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: <FactoryIcon fontSize="small" className="text-blue-800 mr-1" />,
          buttonLabel: 'Selesai Produksi',
          nextStatus: 'Selesai Produksi'
        };
      case 'Selesai Produksi':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: <CheckCircleIcon fontSize="small" className="text-green-800 mr-1" />,
          buttonLabel: 'Siap Kirim',
          nextStatus: 'Siap Kirim'
        };
      case 'Siap Kirim':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-200',
          icon: <LocalShippingIcon fontSize="small" className="text-purple-800 mr-1" />,
          buttonLabel: 'Selesai',
          nextStatus: 'Selesai'
        };
      case 'Selesai':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: <CheckCircleIcon fontSize="small" className="text-gray-800 mr-1" />
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: <InfoIcon fontSize="small" className="text-gray-800 mr-1" />
        };
    }
  };

  const getPaymentStatusInfo = (isPaid, downPaymentStatus) => {
    if (isPaid) {
      return {
        label: 'Lunas',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        icon: <PaidIcon fontSize="small" className="text-green-800 mr-1" />
      };
    } else if (downPaymentStatus === 'paid') {
      return {
        label: 'DP Terbayar',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        icon: <ReceiptIcon fontSize="small" className="text-yellow-800 mr-1" />
      };
    } else {
      return {
        label: 'Belum Bayar',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: <PaidIcon fontSize="small" className="text-red-800 mr-1" />
      };
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

  const statusInfo = getStatusInfo(order.status);
  const paymentInfo = getPaymentStatusInfo(order.paymentDetails?.isPaid, order.paymentDetails?.downPayment?.status);

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
            onClick={() => navigate('/staff/production')}
            icon={<ArrowBackIcon fontSize="small" />}
          />
          {order.status === 'Diproses' && (
            <Button
              label={statusInfo.buttonLabel}
              variant="primary"
              onClick={() => handleStatusChange('Selesai Produksi')}
              icon={<CheckCircleIcon fontSize="small" />}
            />
          )}
          {order.status === 'Selesai Produksi' && (
            <>
              {order.paymentDetails?.isPaid ? (
                <Button
                  label={statusInfo.buttonLabel}
                  variant="success"
                  onClick={() => handleStatusChange('Siap Kirim')}
                  icon={<LocalShippingIcon fontSize="small" />}
                />
              ) : (
                <Button
                  label="Menunggu Pelunasan"
                  variant="danger"
                  disabled={true}
                  title="Pesanan harus lunas sebelum bisa dikirim"
                  icon={<PaidIcon fontSize="small" />}
                />
              )}
            </>
          )}
          {order.status === 'Siap Kirim' && (
            <Button
              label={statusInfo.buttonLabel}
              variant="secondary"
              onClick={() => handleStatusChange('Selesai')}
              icon={<CheckCircleIcon fontSize="small" />}
            />
          )}
        </div>
      </div>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Order Status */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pesanan</h3>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
              {statusInfo.icon}
              {order.status}
            </span>
          </div>
        </Card>
        
        {/* Payment Status */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Status Pembayaran</h3>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentInfo.bgColor} ${paymentInfo.textColor} border ${paymentInfo.borderColor}`}>
              {paymentInfo.icon}
              {paymentInfo.label}
            </span>
          </div>
        </Card>
        
        {/* Estimated Completion */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Estimasi Selesai</h3>
          <div className="flex items-center">
            <CalendarTodayIcon fontSize="small" className="text-blue-500 mr-2" />
            <span>{order.estimatedCompletionDate ? formatDate(order.estimatedCompletionDate) : 'Tidak tersedia'}</span>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Order Items */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <InventoryIcon className="h-5 w-5 mr-2 text-blue-500" />
              Item Pesanan ({order.items.length})
            </h2>
            
            <div className="space-y-6">
              {order.items.map((item, index) => {
                return (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                  >
                    {/* Product Overview */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="flex-shrink-0 md:mr-4 mb-4 md:mb-0">
                          {item.product?.images?.[0] ? (
                            <div className="h-24 w-24 md:h-28 md:w-28">
                              <img 
                                className="h-full w-full rounded-md object-cover border border-gray-200" 
                                src={typeof item.product.images[0] === 'string' 
                                      ? item.product.images[0] 
                                      : item.product.images[0].url} 
                                alt={item.product?.name || 'Produk'}
                                onError={(e) => { e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E'; }}
                              />
                            </div>
                          ) : (
                            <div className="h-24 w-24 md:h-28 md:w-28 bg-gray-100 rounded-md flex items-center justify-center">
                              <InventoryIcon className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-grow">
                          <div className="mb-3">
                            <h3 className="font-medium text-gray-900 text-lg">
                              {item.product?.name || 'Produk tidak tersedia'}
                            </h3>
                            
                            {/* SKU */}
                            {item.sku && (
                              <p className="text-xs text-gray-500 mt-1">
                                SKU: {item.sku}
                              </p>
                            )}
                            
                            {/* Custom Design Badge */}
                            {item.customDesign?.isCustom && (
                              <div className="text-sm text-blue-600 flex items-center mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Desain Kustom
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Jumlah</div>
                              <div className="font-medium mt-1">{item.quantity} pcs</div>
                            </div>
                            
                            {(item.color || item.material) && (
                              <>
                                {item.color && (
                                  <div>
                                    <div className="text-xs text-gray-500 font-medium">Warna</div>
                                    <div className="font-medium mt-1 flex items-center">
                                      {typeof item.color === 'object' && item.color.code && (
                                        <span 
                                          className="inline-block h-3 w-3 rounded-full mr-1" 
                                          style={{ backgroundColor: item.color.code }}
                                        ></span>
                                      )}
                                      {typeof item.color === 'object' ? item.color.name : item.color}
                                    </div>
                                  </div>
                                )}
                                
                                {item.material && (
                                  <div>
                                    <div className="text-xs text-gray-500 font-medium">Bahan</div>
                                    <div className="font-medium mt-1">{typeof item.material === 'object' ? item.material.name : item.material}</div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
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
                                onError={(e) => { 
                                  console.log('Failed to load design image:', item.customDesign.designUrl || item.customDesign.url);
                                  e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22100%22 height%3D%22100%22 viewBox%3D%220 0 100 100%22%3E%3Crect width%3D%22100%22 height%3D%22100%22 fill%3D%22%23f1f5f9%22%2F%3E%3Ctext x%3D%2250%22 y%3D%2250%22 font-family%3D%22Arial%22 font-size%3D%2212%22 text-anchor%3D%22middle%22 dominant-baseline%3D%22middle%22 fill%3D%22%2364748b%22%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E'; 
                                }}
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
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ukuran</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {item.sizeBreakdown && item.sizeBreakdown.map((sizeDetail, i) => (
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
                );
              })}
            </div>
          </Card>
          
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
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <HistoryIcon fontSize="small" className="mr-1 text-gray-500" />
                  Riwayat Status
                </h3>
                <div className="space-y-3 mt-2">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(history.status).bgColor} ${getStatusInfo(history.status).textColor}`}>
                            {getStatusInfo(history.status).icon}
                            {history.status}
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
        
        <div>
          {/* Customer Information */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PersonIcon className="h-5 w-5 mr-2 text-blue-500" />
              Informasi Pelanggan
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <PersonIcon fontSize="small" className="text-gray-500 mr-2" />
                <span className="font-medium">{order.customer?.name || 'Tidak tersedia'}</span>
              </div>
              
              {order.customer?.phone && (
                <div className="flex items-center">
                  <PhoneIcon fontSize="small" className="text-gray-500 mr-2" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
              
              {order.customer?.email && (
                <div className="flex items-center">
                  <EmailIcon fontSize="small" className="text-gray-500 mr-2" />
                  <span>{order.customer.email}</span>
                </div>
              )}
              
              {order.customer?.address && (
                <div className="flex items-start">
                  <LocationOnIcon fontSize="small" className="text-gray-500 mr-2 mt-0.5" />
                  <span className="text-sm">{order.customer.address}</span>
                </div>
              )}
            </div>
          </Card>
          
          {/* Order Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ReceiptIcon className="h-5 w-5 mr-2 text-blue-500" />
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 