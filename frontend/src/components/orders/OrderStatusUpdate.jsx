import React, { useState } from 'react';
import Button from '../common/Button';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const OrderStatusUpdate = ({ order, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const api = useApi();
  const { success: showSuccess, error: showError } = useNotification();
  
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
  
  const getStatusDescription = (status) => {
    switch (status) {
      case 'Diproses':
        return 'Pesanan akan masuk ke proses produksi.';
      case 'Selesai Produksi':
        return 'Pesanan telah selesai diproduksi dan akan siap dikirim.';
      case 'Siap Kirim':
        return 'Pesanan siap dikirim atau diambil oleh pelanggan.';
      case 'Selesai':
        return 'Pesanan telah selesai dan diterima pelanggan.';
      default:
        return '';
    }
  };
  
  const nextStatus = getNextStatus(order.status);
  
  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    
    setLoading(true);
    try {
      const response = await api.patch(`/orders/${order._id}/status`, { status: nextStatus });
      showSuccess(`Status pesanan berhasil diubah ke ${nextStatus}`);
      
      if (response && response.data && response.data.order) {
        onStatusChange(order._id, nextStatus, response.data.order);
      } else {
        onStatusChange(order._id, nextStatus);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Gagal mengubah status pesanan');
    } finally {
      setLoading(false);
    }
  };
  
  if (!nextStatus) {
    return null;
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
      <h3 className="font-medium mb-2">Update Status Pesanan</h3>
      <p className="text-gray-600 mb-4">
        Status saat ini: <span className="font-medium">{order.status}</span>
      </p>
      
      <div className="mb-4">
        <p className="font-medium">Ubah ke: {nextStatus}</p>
        <p className="text-sm text-gray-600">{getStatusDescription(nextStatus)}</p>
      </div>
      
      <Button
        label={`Ubah ke ${nextStatus}`}
        onClick={handleStatusUpdate}
        loading={loading}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        }
      />
    </div>
  );
};

export default OrderStatusUpdate;