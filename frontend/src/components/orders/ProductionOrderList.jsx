import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatter';
import Button from '../common/Button';
import Card from '../common/Card';
import OrderItemCard from './OrderItemCard';

// Import icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const ProductionOrderList = ({ orders, onStatusChange, loading }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Diproses':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: <FactoryIcon fontSize="small" className="text-blue-800 mr-1" />,
          actionBtn: {
            label: 'Selesai Produksi',
            variant: 'primary',
            icon: <CheckCircleIcon fontSize="small" />,
            nextStatus: 'Selesai Produksi'
          }
        };
      case 'Selesai Produksi':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: <CheckCircleIcon fontSize="small" className="text-green-800 mr-1" />,
          actionBtn: {
            label: 'Siap Kirim',
            variant: 'success',
            icon: <LocalShippingIcon fontSize="small" />,
            nextStatus: 'Siap Kirim'
          }
        };
      case 'Siap Kirim':
        return {
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          icon: <LocalShippingIcon fontSize="small" className="text-purple-800 mr-1" />,
          actionBtn: {
            label: 'Selesai',
            variant: 'secondary',
            icon: <CheckCircleIcon fontSize="small" />,
            nextStatus: 'Selesai'
          }
        };
      case 'Selesai':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: <CheckCircleIcon fontSize="small" className="text-gray-800 mr-1" />
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
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
        icon: <PaidIcon fontSize="small" className="text-green-800 mr-1" />
      };
    } else if (downPaymentStatus === 'paid') {
      return {
        label: 'DP',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: <ReceiptIcon fontSize="small" className="text-yellow-800 mr-1" />
      };
    } else {
      return {
        label: 'Belum Bayar',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: <PaidIcon fontSize="small" className="text-red-800 mr-1" />
      };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="p-4 mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <InventoryIcon className="text-gray-400 text-5xl mb-2" />
          <p className="text-gray-500">Tidak ada pesanan yang ditemukan</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status);
        const paymentInfo = getPaymentStatusInfo(
          order.paymentDetails?.isPaid, 
          order.paymentDetails?.downPayment?.status
        );
        
        return (
          <Card key={order._id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="border-l-4 border-blue-500">
              <div className="p-4">
                {/* Header dengan nomor pesanan dan status */}
                <div className="flex flex-wrap justify-between items-center mb-3">
                  <div className="flex items-center mb-2 md:mb-0">
                    <ReceiptIcon className="text-blue-600 mr-2" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">#{order.orderNumber}</h3>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-600 mr-2">{formatDate(order.createdAt)}</p>
                        {order.isOfflineOrder ? (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">Offline</span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Online</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Status Order */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                      {statusInfo.icon}
                      {order.status}
                    </span>
                    
                    {/* Status Pembayaran */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${paymentInfo.bgColor} ${paymentInfo.textColor}`}>
                      {paymentInfo.icon}
                      {paymentInfo.label}
                    </span>
                  </div>
                </div>
                
                {/* Informasi Customer */}
                <div className="mb-3 bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600">
                    <PersonIcon fontSize="small" className="mr-1 text-gray-500" />
                    <span className="font-medium mr-2">Pelanggan:</span>
                    <span>{order.customer?.name || 'Pelanggan tidak dikenal'}</span>
                  </div>
                  {order.estimatedCompletionDate && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <CalendarTodayIcon fontSize="small" className="mr-1 text-gray-500" />
                      <span className="font-medium mr-2">Estimasi Selesai:</span>
                      <span>{formatDate(order.estimatedCompletionDate)}</span>
                    </div>
                  )}
                </div>
                
                {/* Item Pesanan */}
                <div className="bg-gray-50 rounded-lg mb-3">
                  <div className="space-y-2 divide-y divide-gray-100">
                    {order.items.map((item, index) => (
                      <div key={index} className="p-3">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex items-start">
                            {/* Gambar Produk */}
                            <div className="mr-3 flex-shrink-0">
                              {item.product?.images && item.product.images.length > 0 ? (
                                <img 
                                  src={typeof item.product.images[0] === 'string' 
                                        ? item.product.images[0] 
                                        : item.product.images[0].url} 
                                  alt={item.product?.name || 'Product'} 
                                  className="w-16 h-16 object-cover rounded border border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
                                  <InventoryIcon className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Detail Produk */}
                            <div>
                              <span className="font-medium text-gray-800">
                                {item.product?.name || 
                                 (item.sku ? `Produk SKU: ${item.sku}` : 'Produk')}
                              </span>
                              
                              <div className="mt-1">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Jumlah: </span>
                                  {item.quantity} pcs
                                </div>
                                
                                {/* Size Breakdown */}
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.sizeBreakdown && item.sizeBreakdown.map((sb, i) => (
                                    <span key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                                      {sb.size}: {sb.quantity}
                                    </span>
                                  ))}
                                </div>
                                
                                {/* Warna & Material */}
                                {(item.color || item.material) && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {item.color && <span className="mr-2">Warna: {typeof item.color === 'object' ? item.color.name : item.color}</span>}
                                    {item.material && <span>Material: {typeof item.material === 'object' ? item.material.name : item.material}</span>}
                                  </div>
                                )}
                                
                                {/* Kustom Desain */}
                                {item.customDesign && (
                                  <div className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block mt-1">
                                    Desain Kustom
                                  </div>
                                )}

                                {/* Detail Custom Design */}
                                {item.customDesign && item.customDesign.isCustom && (
                                  <div className="mt-3 pt-2 border-t border-gray-200">
                                    <div className="flex items-center text-xs text-blue-600 mb-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span className="font-medium">Detail Desain Kustom</span>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-start gap-3">
                                      {/* Custom Design Image */}
                                      {(item.customDesign.designUrl || item.customDesign.url) && (
                                        <div className="flex-shrink-0">
                                          <img 
                                            src={item.customDesign.designUrl || item.customDesign.url} 
                                            alt="Custom Design" 
                                            className="h-24 w-auto max-w-[120px] object-contain border border-gray-200 rounded-md bg-white p-1"
                                            onError={(e) => { 
                                              console.log('Failed to load design image:', item.customDesign.designUrl || item.customDesign.url);
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
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer dengan aksi */}
                <div className="flex flex-col md:flex-row gap-2 justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <Link
                    to={`/staff/orders/${order._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <InfoIcon fontSize="small" className="mr-1" />
                    Lihat Detail
                  </Link>
                  <div>
                    {statusInfo.actionBtn && (
                      order.status !== 'Selesai Produksi' || order.paymentDetails?.isPaid ? (
                        <Button
                          label={statusInfo.actionBtn.label}
                          variant={statusInfo.actionBtn.variant}
                          size="small"
                          icon={statusInfo.actionBtn.icon}
                          onClick={() => onStatusChange(order._id, statusInfo.actionBtn.nextStatus)}
                        />
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-3 py-1.5 rounded-full flex items-center">
                          <PaidIcon fontSize="small" className="mr-1" />
                          Menunggu Pelunasan
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductionOrderList; 