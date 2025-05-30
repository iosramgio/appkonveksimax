import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/formatter';
import CartSummary from '../../components/cart/CartSummary';

const Cart = () => {
  const { items, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/customer/cart' } });
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Keranjang Belanja</h1>
          <div className="flex flex-col items-center justify-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-600 mb-6">Keranjang belanja Anda kosong.</p>
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

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    showNotification('Item berhasil dihapus dari keranjang', 'success');
  };

  const renderSizeBreakdown = (sizeBreakdown) => {
      return (
      <div className="mt-2">
        <h4 className="font-medium text-gray-700 mb-1">Rincian Ukuran:</h4>
        <div className="grid grid-cols-2 gap-2">
          {sizeBreakdown.map((size, idx) => (
            <div key={idx} className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium">{size.size}:</span> 
              <span>
                {size.quantity} pcs
                {size.additionalPrice > 0 && (
                  <span className="text-blue-600 ml-1">
                    (+{formatCurrency(size.additionalPrice)})
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        </div>
      );
  };

  const PriceDetails = ({ item }) => {
    if (!item?.priceDetails) return null;
    
    const { sizeDetails = [], subtotal = 0, discountPercentage = 0, discountAmount = 0, total = 0, customDesignFee = 0 } = item.priceDetails;
    
    // Calculate total quantity
    const totalQuantity = sizeDetails.reduce((sum, detail) => sum + detail.quantity, 0);
    const totalDozens = Math.floor(totalQuantity / 12);
    const totalDozenQty = totalDozens * 12;
    const totalUnitQty = totalQuantity - totalDozenQty;

    // Sort size details by size
    const sortedDetails = [...sizeDetails].sort((a, b) => {
      const sizeA = a.size.replace(/[^0-9]/g, '') || '0';
      const sizeB = b.size.replace(/[^0-9]/g, '') || '0';
      return parseInt(sizeA) - parseInt(sizeB);
    });

    return (
      <div className="mt-4">
        <h3 className="font-medium text-lg mb-2">Rincian Harga:</h3>
        
        {/* Order Summary */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Ringkasan Pesanan:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <p>Total Kuantitas: <span className="font-medium">{totalQuantity} pcs</span></p>
            </div>
            {totalDozens > 0 && (
              <div className="col-span-2">
                <p className="text-green-600">
                  Harga Lusin: <span className="font-medium">{totalDozens} lusin ({totalDozenQty} pcs)</span>
                </p>
              </div>
            )}
            {totalUnitQty > 0 && (
              <div className="col-span-2">
                <p>Harga Satuan: <span className="font-medium">{totalUnitQty} pcs</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Price Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Ukuran & Material</th>
                <th className="px-4 py-2 text-center">Kuantitas</th>
                <th className="px-4 py-2 text-right">Harga Satuan</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedDetails.map((detail, index) => (
                <tr key={`${detail.size}-${index}`} 
                    className={detail.priceType === 'dozen' ? 'bg-green-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {detail.size} ({detail.priceType === 'dozen' ? 'Harga Lusin' : 'Harga Satuan'})
                    </div>
                    <div className="text-sm text-gray-600">Material: {detail.material}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{detail.quantity} pcs</td>
                  <td className="px-4 py-3 text-right">
                    <div>{formatCurrency(detail.pricePerUnit)}</div>
                    <div className="text-sm text-gray-600">per pcs</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(detail.subtotal)}
                  </td>
                </tr>
              ))}

              {/* Custom Design Fee */}
              {item.customDesign && customDesignFee > 0 && (
                <tr className="bg-blue-50">
                  <td className="px-4 py-3" colSpan="2">
                    <div className="font-medium">Biaya Desain Custom</div>
                    {item.customDesign.notes && (
                      <div className="text-sm text-gray-600">
                        Catatan: {item.customDesign.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>{formatCurrency(item.customDesign.customizationFee)}</div>
                    <div className="text-sm text-gray-600">per pcs</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(customDesignFee)}
                  </td>
                </tr>
              )}

              {/* Subtotal */}
              <tr className="font-medium bg-gray-50">
                <td colSpan="3" className="px-4 py-3 text-right">Subtotal:</td>
                <td className="px-4 py-3 text-right">{formatCurrency(subtotal)}</td>
              </tr>

              {/* Discount */}
              {discountPercentage > 0 && (
                <tr className="text-green-600">
                  <td colSpan="3" className="px-4 py-3 text-right">
                    Diskon ({discountPercentage}%):
                  </td>
                  <td className="px-4 py-3 text-right">
                    -{formatCurrency(discountAmount)}
                  </td>
                </tr>
              )}

              {/* Total */}
              <tr className="font-bold text-lg bg-gray-50">
                <td colSpan="3" className="px-4 py-3 text-right">Total:</td>
                <td className="px-4 py-3 text-right text-primary">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Price Notes */}
        <div className="mt-4 text-sm text-gray-600">
          <p>* Harga lusin diterapkan untuk setiap 12 pcs</p>
          {discountPercentage > 0 && (
            <p>* Diskon {discountPercentage}% diterapkan untuk total pembelian</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Keranjang Belanja</h1>
            <p className="text-gray-600">
              Periksa barang-barang Anda sebelum melanjutkan ke checkout
            </p>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex flex-wrap items-center text-sm">
            <div className="flex items-center text-[#620000] font-medium">
              <span className="flex items-center justify-center bg-[#620000] text-white rounded-full h-5 w-5 mr-2">1</span>
              <span>Keranjang</span>
            </div>
            <div className="mx-2 text-gray-400">→</div>
            <div className="flex items-center text-gray-400">
              <span className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full h-5 w-5 mr-2">2</span>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {items.map((item, index) => (
              <div key={index} className="p-6 border-b last:border-b-0">
                <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
                  <div className="mb-4 md:mb-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{item.productName}</h3>
                        <div className="mt-1 space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Warna:</span>{' '}
                            <span className="inline-flex items-center">
                              <span
                                className="w-4 h-4 rounded-full mr-1"
                                style={{ backgroundColor: item.color.code }}
                              />
                              {item.color.name}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Material:</span> {item.material.name}
                          </p>
                          {renderSizeBreakdown(item.sizeBreakdown)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus dari keranjang"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Catatan dan Desain Kustom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {item.notes && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium text-gray-700 mb-2">Catatan:</h4>
                          <p className="text-sm text-gray-600">{item.notes}</p>
                      </div>
                    )}

                    {item.customDesign && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <h4 className="font-medium text-gray-700 mb-2">Desain Kustom:</h4>
                        <div className="text-sm text-gray-600">
                            {item.customDesign.file ? (
                              <p>
                                <span className="font-medium">File:</span> {item.customDesign.file.name}
                              </p>
                            ) : item.customDesign.url ? (
                              <div>
                                <span className="font-medium">Preview:</span>
                                <div className="mt-2">
                                  <a 
                                    href={item.customDesign.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-block"
                                  >
                                    <img 
                                      src={item.customDesign.url} 
                                      alt="Design preview" 
                                      className="h-16 object-contain rounded border border-gray-300"
                                    />
                                  </a>
                                </div>
                              </div>
                            ) : item.customDesign.designUrl ? (
                              <div>
                                <span className="font-medium">Preview:</span>
                                <div className="mt-2">
                                  <a 
                                    href={item.customDesign.designUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-block"
                                  >
                                    <img 
                                      src={item.customDesign.designUrl} 
                                      alt="Design preview" 
                                      className="h-16 object-contain rounded border border-gray-300"
                                    />
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <p>Desain telah diupload</p>
                            )}
                          {item.customDesign.notes && (
                              <p className="mt-2">
                                <span className="font-medium">Catatan desain:</span> {item.customDesign.notes}
                              </p>
                            )}
                            {item.customDesign.customizationFee > 0 && (
                              <p className="mt-2 text-blue-600">
                                <span className="font-medium">Biaya desain:</span> {formatCurrency(item.customDesign.customizationFee)}/pcs
                              </p>
                          )}
                        </div>
                      </div>
                    )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <PriceDetails item={item} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
};

export default Cart; 