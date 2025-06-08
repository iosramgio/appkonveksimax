import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatter';
import Button from '../common/Button';
import { CHECKOUT } from '../../constants/routes';

const CartSummary = () => {
  const { items, totalItems, subtotal, total } = useCart();
  const navigate = useNavigate();
  
  // Hitung total biaya desain
  const totalDesignFee = items.reduce((sum, item) => 
    sum + (item.customDesign && item.priceDetails 
      ? item.priceDetails.customDesignFee 
      : 0), 0
  );
  
  // Hitung subtotal dari item-item (termasuk biaya desain)
  const itemsSubtotal = items.reduce((sum, item) => 
    sum + (item.priceDetails ? item.priceDetails.subtotal : 0), 0
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Ringkasan Belanja
      </h2>
      
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Item:</span>
          <span className="font-medium">{totalItems} pcs</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal Produk:</span>
          <span className="font-medium">{formatCurrency(itemsSubtotal)}</span>
        </div>
        
        {/* Tambahkan catatan jika ada biaya desain */}
        {totalDesignFee > 0 && (
          <div className="text-xs text-gray-500 -mt-1 mb-1">
            <span>*Termasuk biaya desain custom Rp {totalDesignFee.toLocaleString('id-ID')}</span>
          </div>
        )}
        
        {/* Tampilkan diskon jika ada */}
        {items.some(item => (item.priceDetails?.discountAmount || 0) > 0) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Diskon:</span>
            <span className="font-medium text-green-600">
              -{formatCurrency(items.reduce((sum, item) => sum + (item.priceDetails?.discountAmount || 0), 0))}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-base pt-2 mt-2 border-t border-gray-200">
          <span className="font-bold text-gray-900">Total Pembayaran:</span>
          <span className="font-bold text-blue-600">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          label="Lanjut ke Checkout"
          onClick={() => navigate(CHECKOUT)}
          variant="primary"
          fullWidth={true}
          className="py-3 text-lg font-medium transition-all"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          }
        />
        
        <button
          onClick={() => navigate('/products')}
          className="w-full mt-4 text-center text-blue-600 hover:text-blue-800 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Lanjutkan Belanja
        </button>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100 text-xs text-blue-800">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium mb-1">Informasi:</p>
            <p>Lanjutkan ke halaman checkout untuk menyelesaikan pembelian Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary; 