const Product = require('../models/Product');

/**
 * Calculate price based on size proportions for dozen and unit pricing
 * @param {Object} params - Parameters for price calculation
 * @param {Object} params.product - Product object with basePrice, dozenPrice, customizationFee
 * @param {Array} params.sizeBreakdown - Array of size quantities with additionalPrice
 * @param {Object} params.material - Material object with additionalPrice
 * @param {Object} params.customDesign - Custom design object (optional)
 * @returns {Object} - Detailed price calculation
 */
const calculateItemPrice = ({
  product,
  sizeBreakdown,
  material,
  customDesign
}) => {
  if (!product || !sizeBreakdown || !Array.isArray(sizeBreakdown)) {
    return {
      subtotal: 0,
      total: 0,
      sizeDetails: [],
      totalQuantity: 0,
      totalDozens: 0,
      customDesignFee: 0,
      discountAmount: 0,
      discountPercentage: 0,
      priceComponents: {
        basePrice: 0,
        dozenPrice: 0,
        materialAdditionalPrice: 0,
        customizationFee: 0
      }
    };
  }

  // Calculate total quantity and dozens
  const totalQuantity = sizeBreakdown.reduce((sum, size) => sum + size.quantity, 0);
  const totalDozens = Math.floor(totalQuantity / 12);
  const totalDozenQty = totalDozens * 12;

  // Calculate base prices
  const basePrice = product.basePrice || 0;
  const dozenPrice = product.dozenPrice || 0;
  const materialAdditionalPrice = material?.additionalPrice || 0;

  // Cek apakah harga lusin tersedia dan pesanan mencapai minimum untuk harga lusin (total)
  const useDozenPrice = dozenPrice > 0 && totalQuantity >= 12;
  
  // Mendistribusikan unit dozens ke semua ukuran secara proporsional
  let remainingDozenQty = totalDozenQty;
  
  // Urutkan ukuran berdasarkan harga tambahan (additionalPrice) dari rendah ke tinggi
  // sehingga ukuran dengan harga tambahan terendah mendapat prioritas harga lusin
  const sortedSizes = [...sizeBreakdown].sort((a, b) => 
    (a.additionalPrice || 0) - (b.additionalPrice || 0)
  );
  
  // Alokasi kuantitas lusin untuk setiap ukuran
  const dozenAllocation = sortedSizes.map(size => {
    const dozenQty = Math.min(size.quantity, remainingDozenQty);
    const unitQty = size.quantity - dozenQty;
    remainingDozenQty -= dozenQty;
    
    return {
      ...size,
      dozenQty,
      unitQty
    };
  });
  
  // Mapping kembali ke ukuran asli untuk mempertahankan urutan
  const sizeAllocation = sizeBreakdown.map(originalSize => {
    const allocation = dozenAllocation.find(s => s.size === originalSize.size);
    return allocation || { ...originalSize, dozenQty: 0, unitQty: originalSize.quantity };
  });
  
  // Calculate size details and subtotal
  let subtotal = 0;
  const sizeDetails = sizeAllocation.map(size => {
    const sizeAdditionalPrice = size.additionalPrice || 0;
    let pricePerUnit;
    let itemSubtotal = 0;
    
    // Hitung harga untuk kuantitas lusin
    if (useDozenPrice && size.dozenQty > 0) {
      const dozenUnitPrice = (dozenPrice / 12) + sizeAdditionalPrice + materialAdditionalPrice;
      itemSubtotal += size.dozenQty * dozenUnitPrice;
    }
    
    // Hitung harga untuk kuantitas satuan
    if (size.unitQty > 0) {
      const unitPrice = basePrice + sizeAdditionalPrice + materialAdditionalPrice;
      itemSubtotal += size.unitQty * unitPrice;
    }
    
    // Hitung harga per unit rata-rata
    pricePerUnit = size.quantity > 0 ? itemSubtotal / size.quantity : 0;
    
    subtotal += itemSubtotal;
    
    return {
      size: size.size,
      quantity: size.quantity,
      dozenQuantity: size.dozenQty || 0,
      unitQuantity: size.unitQty || 0,
      pricePerUnit,
      additionalPrice: sizeAdditionalPrice,
      priceType: size.dozenQty > 0 ? 'mixed' : 'unit',
      subtotal: itemSubtotal
    };
  });

  // Calculate custom design fee if applicable
  let customDesignFee = 0;
  if (customDesign?.isCustom && product.customizationFee && product.customizationFee > 0) {
    customDesignFee = product.customizationFee * totalQuantity;
    subtotal += customDesignFee;
  } else if (customDesign?.isCustom && customDesign.customizationFee && customDesign.customizationFee > 0) {
    // Jika ada nilai customizationFee yang disediakan dalam objek customDesign, gunakan itu
    customDesignFee = customDesign.customizationFee * totalQuantity;
    subtotal += customDesignFee;
  }

  // Calculate discount if applicable
  let discountAmount = 0;
  if (product.discount && product.discount > 0) {
    discountAmount = Math.round((subtotal * product.discount) / 100);
  }

  // Calculate final total
  const total = subtotal - discountAmount;

  return {
    subtotal,
    total,
    sizeDetails,
    totalQuantity,
    totalDozens,
    dozenPrice: useDozenPrice ? dozenPrice : 0,
    customDesignFee,
    discountAmount,
    discountPercentage: product.discount || 0,
    priceComponents: {
      basePrice,
      dozenPrice,
      materialAdditionalPrice,
      customizationFee: product.customizationFee || 0
    }
  };
};

/**
 * Calculate price for a product with given specifications
 * @param {Object} params - Parameters for price calculation
 * @param {string} params.productId - Product ID
 * @param {Array} params.items - Array of items with size, material, quantity
 * @param {boolean} params.hasCustomDesign - Whether custom design is applied
 * @param {number} params.customizationFee - Custom design fee (optional)
 * @returns {Object} - Price calculation result
 */
const calculatePrice = async (params) => {
  const { productId, items, hasCustomDesign, customizationFee } = params;
  
  // Find product
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Override product's customization fee if provided
  if (customizationFee !== undefined) {
    product.customizationFee = customizationFee;
  }

  // Calculate price using proportional price calculation
  const result = calculateItemPrice({ product, sizeBreakdown: items, material: product.materials.find(m => m.name === items[0].material), customDesign: hasCustomDesign ? { isCustom: true } : undefined });
  
  return {
    total: result.total,
    subtotal: result.subtotal,
    discount: product.discount || 0, // Use product's discount
    discountAmount: result.discountAmount,
    breakdown: {
      ...result.priceComponents,
      discountPercentage: product.discount || 0 // Ensure discount percentage is from product
    },
    sizeDetails: result.sizeDetails
  };
};

/**
 * Calculate downpayment amount
 * @param {number} totalAmount - Total order amount
 * @param {number} percentage - Downpayment percentage
 * @returns {number} - Downpayment amount
 */
const calculateDownpayment = (totalAmount, percentage) => {
  return (totalAmount * percentage) / 100;
};

/**
 * Calculate bulk price with quantity discounts
 * @param {number} basePrice - Base price per unit
 * @param {number} quantity - Total quantity
 * @returns {number} - Price per unit after bulk discount
 */
const calculateBulkPrice = (basePrice, quantity) => {
  let discount = 0;
  
  if (quantity >= 100) {
    discount = 0.15; // 15% discount for 100+ units
  } else if (quantity >= 50) {
    discount = 0.10; // 10% discount for 50+ units
  } else if (quantity >= 25) {
    discount = 0.05; // 5% discount for 25+ units
  }
  
  return basePrice * (1 - discount);
};

/**
 * Format number to Rupiah currency
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount in Rupiah
 */
const formatToRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

/**
 * Calculate estimated production time
 * @param {number} quantity - Total quantity
 * @param {boolean} hasCustomDesign - Whether custom design is applied
 * @returns {number} - Estimated days for production
 */
const calculateProductionTime = (quantity, hasCustomDesign) => {
  let baseDays = Math.ceil(quantity / 100); // Base 100 units per day
  if (hasCustomDesign) {
    baseDays += 2; // Add 2 days for custom design processing
  }
  return baseDays;
};

module.exports = {
  calculatePrice,
  calculateDownpayment,
  calculateBulkPrice,
  formatToRupiah,
  calculateProductionTime,
  calculateItemPrice
};
