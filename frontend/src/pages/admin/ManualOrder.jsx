import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../../components/orders/OrderForm';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const ManualOrder = () => {
  const [loading, setLoading] = useState(false);
  
  const api = useApi();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const handleSubmit = async (orderData) => {
    setLoading(true);
    
    try {
      const response = await api.post('/orders/manual', orderData);
      
      // Log response untuk debugging
      console.log('Response dari API:', response.data);
      
      // Periksa status pembayaran untuk memastikan perubahan kita berhasil
      if (response.data.order?.paymentDetails?.downPayment) {
        console.log('Status DP:', response.data.order.paymentDetails.downPayment.status);
        console.log('Waktu pembayaran DP:', response.data.order.paymentDetails.downPayment.paidAt || 'tidak ada');
      }
      
      showNotification('Pesanan berhasil dibuat', 'success');
      if (response.data && response.data.order && response.data.order._id) {
        navigate(`/admin/orders/${response.data.order._id}`);
      } else {
        console.error('Order ID not found in response:', response.data);
        showNotification('Pesanan berhasil dibuat, tetapi gagal mengarahkan ke detail pesanan.', 'warning');
        navigate('/admin/orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      // Tampilkan error yang lebih detail
      if (error.response) {
        console.error('Error response:', error.response.data);
        showNotification(`Gagal: ${error.response.data.message || 'Terjadi kesalahan'}`, 'error');
      } else {
        showNotification(error.message || 'Gagal membuat pesanan. Silakan coba lagi.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Buat Pesanan Manual</h1>
        <p className="text-gray-600">
          Form ini digunakan untuk membuat pesanan bagi pelanggan yang datang langsung ke toko atau tidak memiliki akun
        </p>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Panduan Membuat Pesanan Manual</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Isi data pelanggan atau gunakan tombol "Cari Pelanggan" jika sudah terdaftar</li>
                <li>Pilih produk, lalu klik "Tambah" untuk menambahkan ke daftar pesanan</li>
                <li>Tentukan ukuran, warna, bahan, dan jumlah untuk setiap produk</li>
                <li>Centang "Kustom" jika pelanggan memiliki desain sendiri dan unggah file desainnya</li>
                <li>Tentukan metode pembayaran dan status pembayaran (Lunas/DP)</li>
                <li>Klik "Simpan Pesanan" untuk menyelesaikan proses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <OrderForm 
          onSubmit={handleSubmit} 
          isOfflineOrder={true} 
        />
      </div>
    </div>
  );
};

export default ManualOrder;