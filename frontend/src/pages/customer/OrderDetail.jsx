import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { formatDate, formatCurrency } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { ORDERS } from '../../constants/api';
import { calculatePricePerUnit, calculateDetailSubtotal, calculateCustomDesignFee } from '../../utils/pricingCalculator';
import OrderItemCard from '../../components/orders/OrderItemCard';
import { getMidtransConfig } from '../../api/payments';

const OrderStatusSteps = ({ currentStatus, verificationStatus }) => {
  const statuses = ['Pesanan Diterima', 'Diproses', 'Selesai Produksi', 'Siap Kirim', 'Selesai'];
  
  // Handle rejected orders separately
  if (currentStatus === 'Ditolak' || verificationStatus === 'Ditolak') {
    return (
      <div className="py-6">
        <div className="flex items-center justify-center">
          <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {currentStatus === 'Ditolak' ? 'Pesanan Anda telah ditolak' : 'Pesanan Anda tidak diverifikasi'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  const currentIndex = statuses.indexOf(currentStatus);
  
  return (
    <div className="py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-1 bg-blue-600 transition-all duration-500" 
            style={{ width: `${currentIndex >= 0 ? (currentIndex / (statuses.length - 1)) * 100 : 0}%` }}
          ></div>
        </div>
        
        {/* Status Steps */}
        {statuses.map((status, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={status} className="flex flex-col items-center relative z-10">
              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {isActive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Label */}
              <div className="text-xs font-medium text-center mt-2 w-20">
                <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();
  
  const api = useApi();
  const { showNotification, success: showSuccess, error: showError } = useNotification();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`${ORDERS}/${orderId}`);
        if (response.data && response.data.order) {
          setOrder(response.data.order);
          if (response.data.payments) {
            setPayments(response.data.payments);
          }
        } else {
          setError('Data pesanan tidak ditemukan');
          showNotification('Data pesanan tidak ditemukan', 'error');
        }
      } catch (error) {
        console.error('Error fetching order detail:', error);
        if (error.response?.status === 403) {
          setError('Anda tidak memiliki akses ke pesanan ini');
          showNotification('Anda tidak memiliki akses ke pesanan ini', 'error');
          navigate('/customer/orders');
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
  
  useEffect(() => {
    if (order) {
      console.log("OrderDetail Debug - Raw Order Data received in useEffect [order]:", JSON.stringify(order, null, 2));
    }
  }, [order]);
  
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
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const getPaymentStatusClass = (isPaid, downPaymentStatus) => {
    if (isPaid) {
      return 'bg-green-100 text-green-800';
    } else if (downPaymentStatus === 'paid') {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };
  
  const getVerificationBadgeClass = (status) => {
    switch (status) {
      case 'Diverifikasi':
        return 'bg-green-100 text-green-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      
      let paymentType = 'fullPayment';
      let amountToPay = order.paymentDetails.total; // Default ke total keseluruhan
      
      if (order.paymentDetails.downPayment?.status === 'paid' && !order.paymentDetails.isPaid) {
        paymentType = 'remainingPayment';
        amountToPay = order.paymentDetails.remainingPayment.amount; 
      } else if (order.paymentDetails.downPayment?.required && order.paymentDetails.downPayment?.status !== 'paid' && order.paymentDetails.downPayment?.amount > 0) {
        paymentType = 'downPayment';
        amountToPay = order.paymentDetails.downPayment.amount;
      }
      
      if (amountToPay <= 0) {
        showError("Jumlah pembayaran tidak valid.");
        setPaymentLoading(false);
        return;
      }

      const response = await api.post('/payments/pay-order', {
        orderId: order._id,
        paymentType,
        amount: amountToPay
      });
      
      if (!response.data || !response.data.token) {
        throw new Error('Tidak mendapatkan token pembayaran dari server');
      }
      
      // Hapus script lama jika ada
      const existingScript = document.querySelector('script[src*="midtrans"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Get Midtrans configuration from backend
      const configResponse = await getMidtransConfig();
      const { clientKey, snapUrl } = configResponse.data.config;
      
      // Load script Midtrans Snap
      const script = document.createElement('script');
      script.src = snapUrl;
      script.setAttribute('data-client-key', clientKey);
      
      script.onload = () => {
        // Tampilkan Snap payment popup
        window.snap.pay(response.data.token, {
          onSuccess: async function(result) {
            try {
              // Konfirmasi pembayaran ke backend
              const confirmResponse = await api.post('/payments/confirm', {
                orderId: order._id,
                transactionId: result.transaction_id,
                paymentType,
                amount: amountToPay,
                status: 'success',
                paymentMethod: result.payment_type,
                transactionTime: result.transaction_time
              });
              
              console.log('Payment confirmation response:', confirmResponse.data);
              showSuccess('Pembayaran berhasil!');
              setPaymentLoading(false);
              
              // Beri waktu server untuk memproses pembayaran
              setTimeout(async () => {
                try {
                  // Fetch data pesanan terbaru
                  const response = await api.get(`${ORDERS}/${orderId}`);
                  if (response.data && response.data.order) {
                    const updatedOrder = response.data.order;
                    console.log('Updated order data:', updatedOrder.paymentDetails);
                    
                    // Update order dan payments state
                    setOrder(updatedOrder);
                    if (response.data.payments) {
                      setPayments(response.data.payments);
                    }
                    
                    // Verifikasi apakah status pembayaran sudah berubah
                    const isFullyPaid = updatedOrder.paymentDetails.isPaid;
                    const isRemainingPaid = updatedOrder.paymentDetails.remainingPayment?.status === 'paid';
                    
                    if ((paymentType === 'remainingPayment' && !isRemainingPaid) || 
                        (paymentType === 'remainingPayment' && !isFullyPaid)) {
                      console.log('Payment status not updated properly, reloading page...');
                      window.location.reload();
                    } else {
                      console.log('Payment status updated successfully, no need to reload');
                    }
                  } else {
                    console.error('Error refreshing order data: Invalid response');
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error refreshing order data:', error);
                  window.location.reload();
                }
              }, 2000); // Tunggu 2 detik
            } catch (error) {
              console.error('Error saat mengkonfirmasi pembayaran:', error);
              showError('Pembayaran berhasil, tapi gagal memperbarui status. Tim kami akan memverifikasi pembayaran Anda.');
              setPaymentLoading(false);
            }
          },
          onPending: function(result) {
            showSuccess('Pembayaran sedang diproses. Silakan cek email Anda untuk instruksi pembayaran.');
            setPaymentLoading(false);
          },
          onError: function(result) {
            showError('Pembayaran gagal: ' + (result.message || 'Silakan coba lagi.'));
            setPaymentLoading(false);
          },
          onClose: function() {
            showError('Anda menutup popup pembayaran sebelum menyelesaikan transaksi.');
            setPaymentLoading(false);
          }
        });
      };
      
      script.onerror = () => {
        showError('Gagal memuat skrip pembayaran. Silakan coba lagi nanti.');
        setPaymentLoading(false);
      };
      
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('Error saat inisialisasi pembayaran:', error);
      showError('Gagal membuat permintaan pembayaran: ' + (error.message || 'Silakan coba lagi nanti.'));
      setPaymentLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        Memuat detail pesanan...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  // Mengambil nilai langsung dari order.paymentDetails
  const paymentInfo = order.paymentDetails || {};
  const orderSubtotal = paymentInfo.subtotal || 0;
  const orderDiscountPercentage = paymentInfo.discount || 0;
  const orderDiscountAmount = Math.round((orderSubtotal * orderDiscountPercentage) / 100);
  const orderShippingCost = paymentInfo.shippingCost || 0;
  const orderCustomFees = paymentInfo.customFees || 0; // Biaya kustom keseluruhan dari paymentDetails
  const orderTotal = paymentInfo.total || 0;
  const isPaid = paymentInfo.isPaid || false;
  const downPaymentStatus = paymentInfo.downPayment?.status;
  const downPaymentAmount = paymentInfo.downPayment?.amount || 0;
  const remainingPaymentAmount = paymentInfo.remainingPayment?.amount || 0;

  // Hitung total biaya desain kustom dari semua item.priceDetails
  // Ini untuk ditampilkan di ringkasan jika diperlukan,
  // Namun, order.paymentDetails.customFees adalah nilai final yang digunakan untuk total.
  const totalItemCustomDesignFees = order.items.reduce((sum, item) => {
    return sum + (item.priceDetails?.customDesignFee || 0);
  }, 0);
  
  // Subtotal dari semua item (berdasarkan item.priceDetails.total)
  // Ini adalah jumlah dari semua 'total' per item, sudah termasuk diskon item & custom fee item.
  const itemsAggregatedTotal = order.items.reduce((sum, item) => {
    return sum + (item.priceDetails?.total || 0);
  }, 0);
  
  // Seharusnya orderSubtotal dari paymentDetails sudah mencerminkan ini.
  // Kita bisa bandingkan untuk verifikasi jika perlu, tapi paymentInfo.subtotal adalah sumber utama.
  
  // Function to navigate back to orders list with authentication preserved
  const navigateToOrders = () => {
    // console.log('Navigating back to orders with auth token:', sessionStorage.getItem('token')); // Komentari atau hapus jika tidak diperlukan
    if (user && user.role === 'cashier') {
      navigate('/cashier/orders');
    } else { // Default to customer path if not cashier (covers customer role and undefined/other roles)
    if (user && user._id) {
      navigate(`/customer/orders?customer_id=${user._id}`);
    } else {
      navigate('/customer/orders');
      }
    }
  };

  // --- DEBUGGING LOGS ---
  if (order) { // Pastikan order ada sebelum logging
    console.log("OrderDetail Debug - paymentInfo object:", JSON.stringify(paymentInfo, null, 2));
    console.log("OrderDetail Debug - orderSubtotal:", orderSubtotal);
    console.log("OrderDetail Debug - orderDiscountPercentage:", orderDiscountPercentage);
    console.log("OrderDetail Debug - orderDiscountAmount:", orderDiscountAmount);
    console.log("OrderDetail Debug - orderShippingCost:", orderShippingCost);
    console.log("OrderDetail Debug - orderCustomFees (from paymentDetails.customFees):", orderCustomFees);
    console.log("OrderDetail Debug - totalItemCustomDesignFees (calc from items priceDetails):", totalItemCustomDesignFees);
    console.log("OrderDetail Debug - itemsAggregatedTotal (calc from items priceDetails):", itemsAggregatedTotal);
    console.log("OrderDetail Debug - orderTotal:", orderTotal);
  }
  // --- END DEBUGGING LOGS ---
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={navigateToOrders}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali
        </button>
      </div>
      
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detail Pesanan</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Lihat informasi lengkap pesanan Anda</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-1.5 sm:p-2 mr-3 sm:mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pesanan #{order.orderNumber}</h2>
                <p className="text-sm text-gray-600 mt-0.5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-flex items-center ${getStatusBadgeClass(order.status)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                {order.status}
              </span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-flex items-center ${
                getPaymentStatusClass(
                  order.paymentDetails?.isPaid, 
                  order.paymentDetails?.downPayment?.status
                )
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                {order.paymentDetails?.isPaid ? 'Lunas' : 
                 order.paymentDetails?.downPayment?.status === 'paid' ? 'DP Terbayar' : 
                 'Belum Bayar'}
              </span>
              {/* === AWAL PENAMBAHAN BADGE VERIFIKASI & OFFLINE === */}
              {order.verificationStatus && (
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-flex items-center ${getVerificationBadgeClass(order.verificationStatus)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                  {order.verificationStatus}
                </span>
              )}
              {order.isOfflineOrder && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-flex items-center bg-gray-100 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Pesanan Offline
                </span>
              )}
              {/* === AKHIR PENAMBAHAN BADGE VERIFIKASI & OFFLINE === */}
            </div>
          </div>
        </div>
        
        {/* === AWAL PENAMBAHAN CATATAN VERIFIKASI === */}
        {order.verificationNotes && (
          <div className="px-4 sm:px-6 py-3 bg-yellow-50 border-b border-yellow-200 text-xs sm:text-sm text-yellow-800">
            <strong className="font-semibold">Catatan Verifikasi:</strong> {order.verificationNotes}
          </div>
        )}
        {/* === AKHIR PENAMBAHAN CATATAN VERIFIKASI === */}

        {/* Order Progress */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
          <OrderStatusSteps currentStatus={order.status} verificationStatus={order.verificationStatus} />
          {/* === AWAL PENAMBAHAN INFO STATUS HISTORY === */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            (() => {
              const latestStatusEntry = order.statusHistory[order.statusHistory.length - 1];
              if (latestStatusEntry && latestStatusEntry.notes) { // Hanya tampilkan jika ada catatan
                return (
                  <div className="mt-3 text-center text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100">
                    <p className="italic">"{latestStatusEntry.notes}"</p>
                    <p className="mt-1 text-gray-500">({formatDate(latestStatusEntry.timestamp)})</p>
                  </div>
                );
              }
              // Jika tidak ada notes pada entri terakhir, mungkin tampilkan tanggal perubahan status saja
              else if (latestStatusEntry) {
                   return (
                      <div className="mt-3 text-center text-xs text-gray-500">
                          <p>Status terakhir diperbarui pada: {formatDate(latestStatusEntry.timestamp)}</p>
                      </div>
                   );
              }
              return null;
            })()
          )}
          {/* === AKHIR PENAMBAHAN INFO STATUS HISTORY === */}
        </div>
      </div>
      
      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 - Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-base sm:text-lg font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Detail Produk
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => {
                    // Check if product has a discount
                    const hasProductDiscount = item.product && item.product.discount && item.product.discount > 0;
                    
                    return (
                      <div key={index} className="mb-6">
                        {hasProductDiscount && (
                          <div className="mb-2 bg-green-50 px-3 py-2 rounded-md flex items-center text-sm border border-green-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-green-700 font-medium">
                              Produk ini mendapat diskon {item.product.discount}% dari harga asli
                            </span>
                          </div>
                        )}
                        <OrderItemCard item={item} />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-lg border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <p className="text-sm sm:text-base text-gray-500">Tidak ada produk dalam pesanan ini</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-base sm:text-lg font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Detail Pengiriman
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Informasi Penerima</h3>
                  <p className="text-sm sm:text-base font-medium">{order.customer?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{order.customer?.phone}</p>
                </div>
                
                {/* Shipping Info */}
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Alamat Pengiriman</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Jalan:</span> {order.shippingAddress?.street || '-'}</p>
                    {order.shippingAddress?.district && (
                      <p><span className="font-medium">Kecamatan/Kelurahan:</span> {order.shippingAddress.district}</p>
                    )}
                    <p><span className="font-medium">Kota/Kabupaten:</span> {order.shippingAddress?.city || '-'}</p>
                    <p><span className="font-medium">Provinsi:</span> {order.shippingAddress?.province || '-'}</p>
                    <p><span className="font-medium">Kode Pos:</span> {order.shippingAddress?.postalCode || '-'}</p>
                  </div>
                </div>
              </div>
              
              {/* Notes - BARU DIPINDAHKAN KE SINI */}
              {order.notes && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Catatan Pesanan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 italic bg-gray-50 p-3 rounded-md border border-gray-100">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History Section - NEWLY ADDED */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-base sm:text-lg font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Riwayat Status
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div key={history._id || index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(history.status)}`}>
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
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Belum ada riwayat status untuk pesanan ini
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Column 2 - Order Summary */}
        <div>
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 sticky top-4 sm:top-6">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-base sm:text-lg font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Ringkasan Pesanan
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Item:</span>
                  <span className="font-medium">{order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)} pcs</span>
                </div>
                
                {/* Subtotal dari paymentDetails (harga item + biaya kustom item - diskon item) */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal Item:</span>
                  <span className="font-medium">{formatCurrency(orderSubtotal)}</span>
                </div>
                
                {/* Order-level discount */}
                {orderDiscountPercentage > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon Pesanan ({orderDiscountPercentage}%):</span>
                    <span className="font-medium">-{formatCurrency(orderDiscountAmount)}</span>
                  </div>
                )}
                
                {/* Total Biaya Kustom dari paymentDetails.customFees (jika ada dan berbeda dari subtotal items) */}
                {/* Jika orderSubtotal sudah termasuk customFees, bagian ini mungkin tidak diperlukan atau perlu disesuaikan */}
                {/* Untuk saat ini kita asumsikan orderSubtotal sudah termasuk custom fees per item, */}
                {/* dan orderCustomFees adalah jika ada biaya kustom tambahan di level order. */}
                {/* Jika order.paymentDetails.customFees adalah agregat dari item.priceDetails.customDesignFee, maka ini adalah representasi yang benar. */}
                {orderCustomFees > 0 && order.items.length > 0 && (
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-600">Total Biaya Custom Design:</span>
                     <span className="font-medium">{formatCurrency(orderCustomFees)}</span>
                  </div>
                )}
                
                {/* Shipping cost */}
                {orderShippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Pengiriman:</span>
                    <span className="font-medium">{formatCurrency(orderShippingCost)}</span>
                  </div>
                )}
                
                {/* === AWAL BLOK DETAIL PEMBAYARAN BARU === */}
                {paymentInfo.downPayment && paymentInfo.downPayment.amount > 0 && (
                  <>
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Uang Muka (DP)</h4>
                      <div className="space-y-1 text-xs">
                        {paymentInfo.downPayment.percentage && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Persentase DP:</span>
                            <span className="font-medium">{paymentInfo.downPayment.percentage}%</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jumlah DP:</span>
                          <span className="font-medium">{formatCurrency(paymentInfo.downPayment.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${paymentInfo.downPayment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {paymentInfo.downPayment.status === 'paid' ? 'Sudah Dibayar' : paymentInfo.downPayment.status === 'pending' ? 'Menunggu Pembayaran' : paymentInfo.downPayment.status || 'Belum Dibayar'}
                          </span>
                        </div>
                        {paymentInfo.downPayment.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal Pembayaran:</span>
                            <span className="font-medium">{formatDate(paymentInfo.downPayment.paidAt)}</span>
                          </div>
                        )}
                        {paymentInfo.downPayment.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Metode Pembayaran:</span>
                            <span className="font-medium">{paymentInfo.downPayment.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {paymentInfo.remainingPayment && paymentInfo.remainingPayment.amount >= 0 && paymentInfo.downPayment?.status === 'paid' && (
                  <>
                    <div className="pt-3 mt-3 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Sisa Pembayaran</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jumlah:</span>
                          <span className="font-medium">{formatCurrency(paymentInfo.remainingPayment.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${paymentInfo.remainingPayment.status === 'paid' ? 'text-green-600' : paymentInfo.remainingPayment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {paymentInfo.remainingPayment.status === 'paid' ? 'Sudah Dibayar' : paymentInfo.remainingPayment.status === 'pending' ? 'Menunggu Pembayaran' : 'Belum Dibayar'}
                          </span>
                        </div>
                        {paymentInfo.remainingPayment.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal Pembayaran:</span>
                            <span className="font-medium">{formatDate(paymentInfo.remainingPayment.paidAt)}</span>
                          </div>
                        )}
                        {paymentInfo.remainingPayment.paymentMethod && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Metode Pembayaran:</span>
                            <span className="font-medium">{paymentInfo.remainingPayment.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Garis Pemisah sebelum Total Keseluruhan jika ada detail DP/Sisa */}
                {((paymentInfo.downPayment && paymentInfo.downPayment.amount > 0) || (paymentInfo.remainingPayment && paymentInfo.remainingPayment.amount >= 0 && paymentInfo.downPayment?.status === 'paid')) && 
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                }
                
                {/* Total Keseluruhan (sebelumnya Grand Total) */}
                <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-300">
                  <span>Total Keseluruhan:</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>

                {/* Status Pembayaran Keseluruhan */}
                <div className={`mt-3 text-xs font-medium p-2 rounded-md text-center ${isPaid ? 'text-green-700 bg-green-50 border border-green-200' : 'text-yellow-700 bg-yellow-50 border border-yellow-200'}`}>
                  Status Pembayaran: {isPaid ? 'LUNAS' : 'BELUM LUNAS'}
                </div>
                
                {/* Estimasi Selesai */}
                {order.estimatedCompletionDate && (
                  <div className="mt-3 text-xs text-gray-600">
                    <span className="font-medium">Estimasi Selesai:</span> {formatDate(order.estimatedCompletionDate)}
                    </div>
                  )}
                {/* === AKHIR BLOK DETAIL PEMBAYARAN BARU === */}
                
                {/* Tombol Aksi Pembayaran */}
                {!isPaid && order.status !== 'Ditolak' && order.verificationStatus !== 'Ditolak' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {downPaymentStatus === 'paid' ? (
                      // Jika DP sudah dibayar, tampilkan tombol Lunasi Sisa Pembayaran
                      <Button
                        onClick={handlePayment}
                        loading={paymentLoading}
                        fullWidth
                        variant="primary"
                        className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      >
                        {paymentLoading ? 'Memproses...' : `Lunasi Sisa Pembayaran (${formatCurrency(remainingPaymentAmount)})`}
                      </Button>
                    ) : (
                      // Jika belum bayar sama sekali (termasuk DP jika wajib)
                      <Button
                        onClick={handlePayment}
                        loading={paymentLoading}
                        fullWidth
                        variant="primary"
                      >
                        {paymentLoading ? 'Memproses...' : 
                         (paymentInfo.downPayment?.required && paymentInfo.downPayment?.amount > 0 && downPaymentStatus !== 'paid' ? 
                          `Bayar DP (${formatCurrency(downPaymentAmount)})` : 
                          `Bayar Sekarang (${formatCurrency(orderTotal)})`)}
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Pesan untuk pesanan yang ditolak */}
                {(order.status === 'Ditolak' || order.verificationStatus === 'Ditolak') && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="bg-red-50 border border-red-100 rounded-md p-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-red-700 font-medium">Pesanan ini telah ditolak dan tidak dapat diproses lebih lanjut.</span>
                    </div>
                  </div>
                )}
                
                {isPaid && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-green-600 font-medium">Pembayaran Lunas</p>
                  </div>
                )}

              </div>
            </div>
          </div>
          
          {/* Help */}
          {user && user.role !== 'cashier' && (
          <div className="bg-blue-50 rounded-xl shadow-sm overflow-hidden border border-blue-100">
            <div className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-medium text-blue-800 mb-2 sm:mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Butuh Bantuan?
              </h3>
              <p className="text-xs sm:text-sm text-blue-700 mb-2 sm:mb-3">Jika ada pertanyaan tentang pesanan Anda, silakan hubungi customer service kami:</p>
              <a href="tel:+6281234567890" className="flex items-center text-xs sm:text-sm font-medium text-blue-800 hover:text-blue-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +62 812-3456-7890
              </a>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;