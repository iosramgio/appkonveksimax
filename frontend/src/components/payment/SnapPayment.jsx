import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSnapToken, confirmPayment, getMidtransConfig } from '../../api/payments';
import { showNotification } from '../../utils/notifications';

const SnapPayment = ({ orderId, paymentType, amount }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSnap = async () => {
      try {
        setLoading(true);
        
        // Get Midtrans configuration from backend
        const configResponse = await getMidtransConfig();
        const { clientKey, snapUrl } = configResponse.data.config;
        
        // Get Snap token from backend
        const response = await createSnapToken({
          orderId,
          paymentType,
          amount
        });

        // Load Midtrans Snap script
        const script = document.createElement('script');
        script.src = snapUrl;
        script.setAttribute('data-client-key', clientKey);
        
        script.onload = () => {
          // Initialize Snap
          window.snap.pay(response.data.token, {
            onSuccess: async function(result) {
              try {
                await confirmPayment({
                  orderId,
                  transactionId: result.transaction_id,
                  status: 'success',
                  paymentType,
                  amount,
                  ...result
                });
                showNotification('Pembayaran berhasil!', 'success');
              } catch (error) {
                console.error('Error confirming payment:', error);
                showNotification('Pembayaran berhasil, tapi gagal mengupdate status', 'warning');
              }
              navigate('/customer/orders');
            },
            onPending: async function(result) {
              try {
                await confirmPayment({
                  orderId,
                  transactionId: result.transaction_id,
                  status: 'pending',
                  paymentType,
                  amount,
                  ...result
                });
                showNotification('Menunggu pembayaran...', 'info');
              } catch (error) {
                console.error('Error confirming payment:', error);
                showNotification('Status pembayaran pending, tapi gagal mengupdate status', 'warning');
              }
              navigate('/customer/orders');
            },
            onError: function(result) {
              showNotification('Pembayaran gagal, silakan coba lagi', 'error');
              navigate('/customer/orders');
            },
            onClose: function() {
              showNotification('Pembayaran dibatalkan', 'warning');
              navigate('/customer/orders');
            }
          });
        };
        document.body.appendChild(script);

        return () => {
          const existingScript = document.querySelector('script[src*="midtrans"]');
          if (existingScript) {
            document.body.removeChild(existingScript);
          }
        };
      } catch (error) {
        console.error('Error loading Snap:', error);
        showNotification('Gagal memuat halaman pembayaran', 'error');
        navigate(`/customer/orders/${orderId}`);
      } finally {
        setLoading(false);
      }
    };

    loadSnap();
  }, [orderId, paymentType, amount, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman pembayaran...</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Halaman Pembayaran</h2>
          <p className="text-gray-600">Anda akan diarahkan ke halaman pembayaran Midtrans...</p>
        </div>
      )}
    </div>
  );
};

export default SnapPayment; 