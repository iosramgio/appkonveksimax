import React from 'react';
import { formatCurrency } from '../../utils/formatter';
import { calculatePriceBreakdown } from '../../utils/pricingCalculator';

const OrderItemCard = ({ item, compact = false }) => {
  if (!item || !item.product) return null;

  let productDisplayImage = null;
  if (item.product.images && item.product.images.length > 0 && item.product.images[0].url) {
    productDisplayImage = item.product.images[0].url;
  } else if (item.productDetails && item.productDetails.images && item.productDetails.images.length > 0 && item.productDetails.images[0].url) {
    productDisplayImage = item.productDetails.images[0].url;
  }

  let priceDetailsToUse;

  if (item.priceDetails && typeof item.priceDetails === 'object' && Object.keys(item.priceDetails).length > 0) {
    // Jika item.priceDetails ada dan valid, gunakan itu
    priceDetailsToUse = {
      subtotal: item.priceDetails.subtotal || 0,
      total: item.priceDetails.total || 0,
      sizeDetails: item.priceDetails.sizeDetails || [],
      totalQuantity: item.priceDetails.totalQuantity || item.quantity || 0,
      totalDozens: item.priceDetails.totalDozens || 0,
      customDesignFee: item.priceDetails.customDesignFee || 0,
      discountAmount: item.priceDetails.discountAmount || 0,
      discountPercentage: item.priceDetails.discountPercentage || 0,
      // priceComponents bisa bersifat opsional di frontend jika hanya total yang penting
      // Namun, untuk konsistensi, kita bisa menambahkannya jika ada
      priceComponents: item.priceDetails.priceComponents || {
        basePrice: item.product.basePrice || 0,
        dozenPrice: item.product.dozenPrice || 0,
        materialAdditionalPrice: item.material?.additionalPrice || 0,
        customizationFee: item.customDesign?.customizationFee || item.priceDetails.customDesignFee || 0,
      },
    };
  } else {
    // Fallback ke calculatePriceBreakdown jika item.priceDetails tidak ada atau tidak valid
    // Pastikan product object yang dikirim ke calculatePriceBreakdown memiliki semua field yang dibutuhkan.
    const productForCalc = {
      basePrice: item.product.basePrice || 0,
      dozenPrice: item.product.dozenPrice || 0,
      discount: item.product.discount || 0,
      // Ambil customizationFee dari item.customDesign jika ada, atau dari item.product jika ada, atau 0
      customizationFee: item.customDesign?.customizationFee || item.product.customizationFee || 0,
    };

    priceDetailsToUse = calculatePriceBreakdown({
      sizeBreakdown: item.sizeBreakdown || [],
      product: productForCalc,
      material: item.material,
      // Pastikan customDesign.customizationFee juga diteruskan jika ada dan berbeda
      customDesign: item.customDesign ? { 
        isCustom: true, 
        customizationFee: item.customDesign.customizationFee // Pastikan ini diteruskan
      } : null
    });
  }

  const {
    subtotal,
    total,
    // sizeDetails, // Tidak digunakan secara langsung di scope ini, tapi ada di priceDetailsToUse
    totalQuantity,
    // totalDozens, // Tidak digunakan secara langsung di scope ini
    customDesignFee,
    discountAmount,
    discountPercentage
  } = priceDetailsToUse;

  // Get base price info
  const basePrice = item.product.basePrice;
  const dozenPrice = item.product.dozenPrice;
  const hasDozenPrice = dozenPrice && item.quantity >= 12;

  if (compact) {
    return (
      <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
        <div>
          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
          <p className="text-sm text-gray-500">{item.quantity} pcs</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">{formatCurrency(total)}</p>
          {discountAmount > 0 && (
            <p className="text-sm text-green-600">-{formatCurrency(discountAmount)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {productDisplayImage && (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
          <img 
            src={productDisplayImage} 
            alt={item.product.name} 
            className="object-contain w-full h-full"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Color */}
          <div>
            <span className="text-sm text-gray-500">Warna:</span>
            <span className="text-sm font-medium ml-1">{item.color?.name || "N/A"}</span>
          </div>

          {/* Material */}
          <div>
            <span className="text-sm text-gray-500">Material:</span>
            <span className="text-sm font-medium ml-1">
              {item.material?.name || "N/A"}
            </span>
          </div>

          {/* Size Breakdown */}
          <div className="col-span-2">
            <span className="text-sm text-gray-500">Ukuran:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {item.sizeBreakdown?.map((size, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100">
                  {size.size}: {size.quantity} pcs
                </span>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="col-span-2 mt-4">
            <h4 className="font-medium mb-2">Rincian Harga:</h4>
            
            {/* Base Price */}
            <div className="space-y-1 text-sm">
              {/* Informasi Harga Lusin */}
              {totalQuantity >= 12 && dozenPrice > 0 ? (
                <div>
                  {/* Menampilkan informasi harga lusin berdasarkan total */}
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>Total Pesanan: {totalQuantity} pcs</span>
                    <span>({Math.floor(totalQuantity / 12)} lusin, {totalQuantity % 12} pcs)</span>
                  </div>
                  
                  {/* Rincian per ukuran */}
                  {priceDetailsToUse.sizeDetails?.map((sizeDetail, idx) => (
                    <div key={idx} className="ml-2 mt-1">
                      <div className="flex justify-between">
                        <span>Ukuran {sizeDetail.size}: {sizeDetail.quantity} pcs</span>
                        <span>{formatCurrency(sizeDetail.pricePerUnit)}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between mt-2">
                    <span>Harga Lusin</span>
                    <span>{formatCurrency(dozenPrice)} / lusin</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harga Satuan</span>
                    <span>{formatCurrency(basePrice)} / pcs</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    * Harga lusin diterapkan untuk total pesanan ≥ 12 pcs
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span>Harga Satuan ({item.quantity} pcs)</span>
                  <span>{formatCurrency(basePrice)} / pcs</span>
                </div>
              )}

              {/* Custom Design Fee */}
              {item.customDesign?.isCustom && (
                <div className="flex justify-between text-blue-600">
                  <span>Biaya Desain Kustom</span>
                  <div>
                    {customDesignFee > 0 ? (
                      <span>+{formatCurrency(customDesignFee)}</span>
                    ) : (
                      <span>Gratis</span>
                    )}
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon ({discountPercentage}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Design Details */}
        {(item.customDesign?.isCustom && (item.customDesign?.designUrl || item.customDesign?.notes)) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Detail Desain Kustom:</h4>
            {item.customDesign.designUrl && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">File Desain:</p>
                <img 
                  src={item.customDesign.designUrl} 
                  alt="Custom Design" 
                  className="max-w-xs max-h-48 rounded border" 
                />
              </div>
            )}
            {item.customDesign.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Catatan Desain:</p>
                <p className="text-sm text-gray-600">{item.customDesign.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Catatan:</h4>
            <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItemCard; 