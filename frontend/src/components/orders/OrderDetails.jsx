import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate, formatCurrency } from '../../utils/formatter';
import { usePermission } from '../../hooks/usePermission';
import { calculatePriceBreakdown } from '../../utils/pricingCalculator';

const OrderDetails = ({ 
  order, 
  onStatusChange, 
  onGenerateInvoice,
  onSendWhatsApp
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const { hasPermission } = usePermission();
  
  if (!order) return <div className="p-6">Loading order details...</div>;
  
  const { 
    orderNumber, 
    createdAt, 
    customer, 
    items, 
    status, 
    paymentStatus,
    notes,
    deliveryMethod,
    deliveryAddress,
    deliveryDate
  } = order;
  
  const canChangeStatus = hasPermission(['admin', 'cashier']) || 
    (hasPermission(['staff']) && status === 'Diproses');
  
  const canSendWhatsApp = hasPermission(['admin', 'cashier']);
  const canGenerateInvoice = hasPermission(['admin', 'cashier', 'owner']);
  
  const statusOptions = [
    { value: 'Pesanan Diterima', label: 'Pesanan Diterima' },
    { value: 'Diproses', label: 'Diproses' },
    { value: 'Selesai Produksi', label: 'Selesai Produksi' },
    { value: 'Siap Kirim', label: 'Siap Kirim' },
    { value: 'Selesai', label: 'Selesai' }
  ];
  
  // Filter status options based on user role
  const filteredStatusOptions = hasPermission(['staff']) 
    ? statusOptions.filter(s => ['Diproses', 'Selesai Produksi'].includes(s.value))
    : statusOptions;
  
  const handleOpenStatusModal = () => {
    setSelectedStatus(status);
    setShowStatusModal(true);
  };
  
  const handleStatusChange = () => {
    if (selectedStatus && selectedStatus !== status) {
      onStatusChange(order._id, selectedStatus);
    }
    setShowStatusModal(false);
  };
  
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

  // Calculate total items and prices
  const calculateOrderSummary = () => {
    return items.reduce((summary, item) => {
      const priceBreakdown = calculatePriceBreakdown({
        sizeBreakdown: item.sizeBreakdown || [],
        product: item.product,
        material: item.material,
        customDesign: item.customDesign
      });

      return {
        totalItems: summary.totalItems + item.quantity,
        subtotal: summary.subtotal + priceBreakdown.subtotal,
        discount: summary.discount + priceBreakdown.discountAmount,
        customDesignFee: summary.customDesignFee + priceBreakdown.customDesignFee,
        total: summary.total + priceBreakdown.total
      };
    }, {
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      customDesignFee: 0,
      total: 0
    });
  };

  const orderSummary = calculateOrderSummary();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Order #{orderNumber}</h1>
            <p className="text-gray-600">Tanggal Order: {formatDate(createdAt)}</p>
          </div>
          
          <div className="flex mt-4 sm:mt-0 gap-2">
            {canGenerateInvoice && (
              <Button
                label="Cetak Invoice"
                variant="outline"
                onClick={() => onGenerateInvoice(order._id)}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                }
              />
            )}
            
            {canSendWhatsApp && (
              <Button
                label="Kirim WhatsApp"
                variant="outline"
                onClick={() => onSendWhatsApp(order._id)}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                }
              />
            )}
            
            {canChangeStatus && (
              <Button
                label="Ubah Status"
                onClick={handleOpenStatusModal}
              />
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(status)}`}>
            Status: {status}
          </span>
          
          <span className={`px-3 py-1 rounded-full text-sm ${
            paymentStatus === 'Lunas' 
              ? 'bg-green-100 text-green-800' 
              : paymentStatus === 'DP' 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            Pembayaran: {paymentStatus}
          </span>
        </div>
      </div>
      
      {/* Customer Info */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-medium mb-4">Informasi Customer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
            <p className="font-medium">{customer?.name}</p>
            <p className="text-gray-600">{customer?.email}</p>
            <p className="text-gray-600">{customer?.phone}</p>
          </div>
          
          <div>
            {deliveryMethod && (
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Metode Pengiriman</h3>
                <p>{deliveryMethod}</p>
              </div>
            )}
            
            {deliveryAddress && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Alamat Pengiriman</h3>
                <p className="whitespace-pre-line text-gray-700">{deliveryAddress}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order Items Table */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Pesanan</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spesifikasi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Satuan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => {
                const priceBreakdown = calculatePriceBreakdown({
                  sizeBreakdown: item.sizeBreakdown || [],
                  product: item.product,
                  material: item.material,
                  customDesign: item.customDesign
                });

                const {
                  subtotal,
                  total,
                  customDesignFee,
                  discountAmount,
                  discountPercentage
                } = priceBreakdown;

                const basePrice = item.product?.basePrice || 0;
                const dozenPrice = item.product?.dozenPrice || 0;
                const hasDozenPrice = dozenPrice && item.quantity >= 12;

                return (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{item.product?.name || 'Produk tidak tersedia'}</p>
                        <p className="text-xs text-gray-500">SKU: {item.sku || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <p>Ukuran: {item.sizeBreakdown?.map(sb => `${sb.size} (${sb.quantity})`).join(', ')}</p>
                        <p>Warna: {item.color?.name || '-'}</p>
                        <p>Bahan: {item.material?.name}</p>
                        {item.customDesign?.isCustom && (
                          <p className="text-blue-600">Desain Kustom</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {hasDozenPrice ? (
                          <>
                            <p>{formatCurrency(dozenPrice)} / lusin</p>
                            <p className="text-xs text-gray-500">{formatCurrency(basePrice)} / pcs</p>
                          </>
                        ) : (
                          <p>{formatCurrency(basePrice)} / pcs</p>
                        )}
                        {discountPercentage > 0 && (
                          <p className="text-xs text-green-600">
                            Diskon {discountPercentage}%
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{formatCurrency(total)}</p>
                        {discountAmount > 0 && (
                          <p className="text-xs text-green-600">
                            -Diskon {formatCurrency(discountAmount)}
                          </p>
                        )}
                        {customDesignFee > 0 && (
                          <p className="text-xs text-blue-600">
                            +Biaya Desain {formatCurrency(customDesignFee)}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="4" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  Subtotal
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(order.paymentDetails?.subtotal || 0)}
                </td>
              </tr>
              {order.paymentDetails?.discount > 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-sm font-medium text-green-600 text-right">
                    Diskon ({order.paymentDetails.discount}%)
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    -{formatCurrency((order.paymentDetails.subtotal * order.paymentDetails.discount) / 100)}
                  </td>
                </tr>
              )}
              {order.paymentDetails?.customFees > 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Biaya Tambahan
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(order.paymentDetails.customFees)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan="4" className="px-6 py-4 text-base font-bold text-gray-900 text-right">
                  Total
                </td>
                <td className="px-6 py-4 text-base font-bold text-gray-900">
                  {formatCurrency(order.paymentDetails?.total || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="p-6 border-t">
        <h2 className="text-lg font-medium mb-4">Ringkasan Pesanan</h2>
        <div className="space-y-3">
          {/* Total Items */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Item</span>
            <span className="font-medium">{orderSummary.totalItems} pcs</span>
          </div>

          {/* Original Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal (Harga Asli)</span>
            <span className="font-medium">{formatCurrency(orderSummary.subtotal)}</span>
          </div>

          {/* Product Discounts */}
          {orderSummary.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Diskon Produk</span>
              <span>-{formatCurrency(orderSummary.discount)}</span>
            </div>
          )}

          {/* Custom Design Fees */}
          {orderSummary.customDesignFee > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Biaya Desain Kustom</span>
              <span>+{formatCurrency(orderSummary.customDesignFee)}</span>
            </div>
          )}

          {/* Additional Fees if any */}
          {order.paymentDetails?.customFees > 0 && (
            <div className="flex justify-between text-sm">
              <span>Biaya Tambahan</span>
              <span>+{formatCurrency(order.paymentDetails.customFees)}</span>
            </div>
          )}

          {/* Delivery Fee if any */}
          {order.paymentDetails?.deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Biaya Pengiriman</span>
              <span>+{formatCurrency(order.paymentDetails.deliveryFee)}</span>
            </div>
          )}

          {/* Total */}
          <div className="pt-3 border-t">
            <div className="flex justify-between text-base font-bold">
              <span>Total Pembayaran</span>
              <span>{formatCurrency(orderSummary.total)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status Pembayaran</span>
            <span className={`font-medium ${
              paymentStatus === 'Lunas' 
                ? 'text-green-600' 
                : paymentStatus === 'DP' 
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}>
              {paymentStatus}
            </span>
          </div>

          {/* Payment Details for DP */}
          {paymentStatus === 'DP' && (
            <>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm text-green-600">
                  <span>DP Terbayar ({order.paymentDetails?.downPayment?.percentage || 0}%)</span>
                  <span>{formatCurrency(order.paymentDetails?.downPayment?.amount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600 mt-1">
                  <span>Sisa Pembayaran</span>
                  <span>{formatCurrency(order.paymentDetails?.remainingPayment?.amount || 0)}</span>
                </div>
              </div>
              {order.paymentDetails?.paymentDueDate && (
                <div className="text-sm text-gray-600 mt-2">
                  Batas Waktu Pelunasan: {formatDate(order.paymentDetails.paymentDueDate)}
                </div>
              )}
            </>
          )}

          {/* Payment Method */}
          {order.paymentDetails?.method && (
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600">
                <span>Metode Pembayaran: </span>
                <span className="font-medium">{order.paymentDetails.method}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="p-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes */}
          {notes && (
            <div>
              <h2 className="text-lg font-medium mb-2">Catatan Pesanan</h2>
              <p className="text-gray-700 whitespace-pre-line">{notes}</p>
            </div>
          )}
          
          {/* Delivery Information */}
          <div>
            <h2 className="text-lg font-medium mb-2">Informasi Pengiriman</h2>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-600">Metode Pengiriman: </span>
                <span className="font-medium">{deliveryMethod || '-'}</span>
              </div>
              {deliveryAddress && (
                <div className="text-sm">
                  <span className="text-gray-600">Alamat Pengiriman:</span>
                  <p className="mt-1 whitespace-pre-line">{deliveryAddress}</p>
                </div>
              )}
              {deliveryDate && (
                <div className="text-sm">
                  <span className="text-gray-600">Tanggal Pengiriman: </span>
                  <span className="font-medium">{formatDate(deliveryDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Ubah Status Pesanan"
      >
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Pesanan
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filteredStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              label="Batal"
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            />
            <Button
              label="Simpan"
              onClick={handleStatusChange}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;