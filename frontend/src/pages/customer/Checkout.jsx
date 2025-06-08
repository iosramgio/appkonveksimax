import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

const Checkout = () => {
  const { items, total, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: '/customer/checkout' } });
    }
  }, [isAuthenticated, navigate, loading]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h1 className="text-2xl font-semibold">Memuat data pesanan...</h1>
            <p className="text-gray-600 mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan pesan jika cart kosong
  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="text-2xl font-semibold mb-2">Keranjang Belanja Kosong</h1>
            <p className="text-gray-600 mb-6">
              Silakan tambahkan produk ke keranjang terlebih dahulu untuk melanjutkan ke checkout
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Lihat Produk
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Checkout</h1>
            <p className="text-gray-600">
              Selesaikan pesanan Anda dengan mengisi formulir di bawah ini
            </p>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex flex-wrap items-center text-sm">
            <div className="flex items-center text-blue-600 font-medium">
              <span className="flex items-center justify-center bg-blue-600 text-white rounded-full h-5 w-5 mr-2">1</span>
              <span>Keranjang</span>
            </div>
            <div className="mx-2 text-gray-400">→</div>
            <div className="flex items-center text-blue-600 font-medium">
              <span className="flex items-center justify-center bg-blue-600 text-white rounded-full h-5 w-5 mr-2">2</span>
              <span>Checkout</span>
            </div>
            <div className="mx-2 text-gray-400">→</div>
            <div className="flex items-center text-gray-400">
              <span className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full h-5 w-5 mr-2">3</span>
              <span>Pembayaran</span>
            </div>
            <div className="mx-2 text-gray-400">→</div>
            <div className="flex items-center text-gray-400">
              <span className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full h-5 w-5 mr-2">4</span>
              <span>Selesai</span>
            </div>
          </div>
        </div>
      </div>
      
      <CheckoutForm />
    </div>
  );
};

export default Checkout;