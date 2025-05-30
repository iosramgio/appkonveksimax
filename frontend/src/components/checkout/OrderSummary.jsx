import React from 'react';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatter';

const OrderSummary = () => {
  const { items, total } = useCart();
  
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan Pesanan</h2>
        <div className="flex flex-col items-center justify-center py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-gray-600 text-center">Keranjang belanja Anda kosong.</p>
        </div>
      </div>
    );
  }
  
  // Hitung total item
  const totalItems = items.reduce((sum, item) => 
    sum + item.sizeBreakdown.reduce((sizeSum, size) => sizeSum + size.quantity, 0), 0
  );
  
  // Hitung total biaya desain
  const totalDesignFee = items.reduce((sum, item) => 
    sum + (item.customDesign ? (item.customDesign.customizationFee || 0) * 
      item.sizeBreakdown.reduce((q, s) => q + s.quantity, 0) : 0), 0
  );
  
  // Hitung total diskon
  const totalDiscountAmount = items.reduce((sum, item) => 
    sum + (item.priceDetails?.discountAmount || 0), 0
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Ringkasan Pesanan
      </h2>
      
      <div className="overflow-y-auto max-h-96 pr-2 mb-4 -mr-2">
        <div className="space-y-4">
          {items.map((item, index) => {
            const totalQuantity = item.sizeBreakdown.reduce((sum, size) => sum + size.quantity, 0);
            
            return (
              <div key={index} className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex items-start">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.productName}</h3>
                    <div className="flex flex-wrap mt-1 text-xs text-gray-600">
                      <p className="flex items-center mr-3">
                        <span className="font-medium">Warna:</span>
                        <span className="inline-flex items-center ml-1">
                          <span 
                            className="w-3 h-3 rounded-full mr-1" 
                            style={{ backgroundColor: item.color.code }}
                          ></span>
                          {item.color.name}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Bahan:</span> {item.material.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-xs">
                  <div className="flex justify-between items-center bg-white rounded p-2 border border-gray-100">
                    <span className="font-medium text-gray-900">Jumlah:</span>
                    <span className="font-medium">{totalQuantity} pcs</span>
                  </div>
                  
                  <div className="mt-1 grid grid-cols-2 gap-1">
                    {item.sizeBreakdown.map((sizeDetail, idx) => (
                      <div key={idx} className="text-gray-600 bg-white rounded p-1 border border-gray-100">
                        <span className="font-medium">{sizeDetail.size}:</span> {sizeDetail.quantity} pcs
                      </div>
                    ))}
                  </div>
                </div>

                {item.customDesign && (
                  <div className="mt-2 bg-blue-50 p-2 rounded-md border border-blue-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-blue-800">Custom Design</span>
                      </div>
                      <span className="text-blue-600 font-medium">
                        {formatCurrency(item.customDesign.customizationFee || 0)} × {totalQuantity} pcs
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.priceDetails?.total || 
                      (item.quantity * item.basePrice + 
                      (item.customDesign?.customizationFee || 0) * totalQuantity)
                    )}
                  </span>
                </div>
                
                {/* Tampilkan diskon item jika ada */}
                {item.priceDetails?.discountAmount > 0 && (
                  <div className="mt-1 flex justify-between items-center text-green-600">
                    <span className="text-xs">Diskon ({item.priceDetails.discountPercentage}%)</span>
                    <span className="text-xs font-medium">-{formatCurrency(item.priceDetails.discountAmount)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({totalItems} items):</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          
          {totalDesignFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Biaya Desain Custom:</span>
              <span className="font-medium text-blue-600">{formatCurrency(totalDesignFee)}</span>
            </div>
          )}
          
          {totalDiscountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Diskon:</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(totalDiscountAmount)}
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
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100 text-xs text-blue-800">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium mb-1">Informasi Pembayaran:</p>
            <p>Dengan melanjutkan, Anda akan diarahkan ke halaman pembayaran untuk menyelesaikan transaksi.</p>
            {totalDiscountAmount > 0 && (
              <p className="mt-2 text-green-600 font-medium">Anda mendapatkan diskon sebesar {formatCurrency(totalDiscountAmount)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;