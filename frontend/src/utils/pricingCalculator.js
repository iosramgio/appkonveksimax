// ==================================================================
// IMPORTANT: Price Calculation Strategy
// ==================================================================
// This file contains price calculation utilities that should be kept in sync 
// with the backend calculations in backend/utils/priceCalculator.js
//
// For most accurate pricing, use the calculatePrice API function which calls
// the backend endpoint directly.
//
// The calculatePriceBreakdown function is a client-side fallback that should 
// produce identical results to the backend's calculateItemPrice function.
// ==================================================================

import axios from 'axios';
import { formatCurrency } from './formatter';

// Buat instance axios dengan konfigurasi default
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Calculate the price of a product using the backend API
 * This is the recommended method to ensure frontend and backend prices are consistent
 * 
 * @param {Object} options - Configuration options for price calculation
 * @param {string} options.productId - ID of the product
 * @param {Array} options.items - Array of items with size, material, and quantity
 * @param {boolean} options.hasCustomDesign - Whether the product has a custom design
 * @param {number} options.customizationFee - Optional customization fee
 * @returns {Promise<Object>} - The calculated price details
 */
export const calculatePrice = async ({
  productId,
  items,
  hasCustomDesign = false,
  customizationFee
}) => {
  try {
    const response = await api.post('/products/calculate-price', {
      productId,
      items,
      customDesign: hasCustomDesign,
      customizationFee
    });
    return response.data;
  } catch (error) {
    console.error('Price calculation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to calculate price');
  }
};

/**
 * Calculate the deposit amount based on order total and deposit percentage
 * 
 * @param {number} totalAmount - Total order amount
 * @param {number} depositPercentage - Deposit percentage (default: 30%)
 * @returns {number} - The deposit amount
 */
export const calculateDeposit = (totalAmount, depositPercentage = 30) => {
  if (!totalAmount || totalAmount <= 0) return 0;
  
  const depositAmount = (totalAmount * depositPercentage) / 100;
  
  // Round to 2 decimal places
  return Math.round(depositAmount * 100) / 100;
};

/**
 * Calculate the remaining balance after deposit
 * 
 * @param {number} totalAmount - Total order amount
 * @param {number} depositAmount - Deposit amount already paid
 * @returns {number} - The remaining balance
 */
export const calculateRemainingBalance = (totalAmount, depositAmount = 0) => {
  if (!totalAmount || totalAmount <= 0) return 0;
  
  const remainingBalance = totalAmount - depositAmount;
  
  // Round to 2 decimal places and ensure it's not negative
  return Math.max(0, Math.round(remainingBalance * 100) / 100);
};

/**
 * Calculate price per unit including additional costs
 * @param {Object} params
 * @param {number} params.basePrice - Base price per unit
 * @param {number} params.dozenPrice - Price per dozen
 * @param {number} params.sizeAdditional - Additional price for size
 * @param {number} params.materialAdditional - Additional price for material
 * @param {boolean} params.isDozen - Whether to use dozen pricing
 * @returns {number} - Price per unit
 */
export const calculatePricePerUnit = ({
  basePrice,
  dozenPrice,
  sizeAdditional = 0,
  materialAdditional = 0,
  isDozen = false
}) => {
  const base = isDozen ? Math.round(dozenPrice / 12) : basePrice;
  return Math.round(base + sizeAdditional + materialAdditional);
};

/**
 * Calculate subtotal for a single size detail
 * @param {Object} params
 * @param {number} params.quantity - Quantity of items
 * @param {number} params.pricePerUnit - Price per unit
 * @returns {number} - Subtotal for this size detail
 */
export const calculateDetailSubtotal = ({
  quantity,
  pricePerUnit
}) => {
  return Math.round(quantity * pricePerUnit);
};

/**
 * Calculate custom design fee
 * @param {Object} params
 * @param {number} params.feePerUnit - Fee per unit for custom design
 * @param {number} params.totalQuantity - Total quantity of items
 * @returns {number} - Total custom design fee
 */
export const calculateCustomDesignFee = ({
  feePerUnit,
  totalQuantity
}) => {
  return Math.round(feePerUnit * totalQuantity);
};

/**
 * Calculate discount amount
 * @param {Object} params
 * @param {number} params.subtotal - Subtotal before discount
 * @param {number} params.discountPercentage - Discount percentage
 * @returns {number} - Discount amount
 */
export const calculateDiscountAmount = ({
  subtotal,
  discountPercentage
}) => {
  return Math.round((subtotal * discountPercentage) / 100);
};

/**
 * Calculate total after discount
 * @param {Object} params
 * @param {number} params.subtotal - Subtotal before discount
 * @param {number} params.discountAmount - Discount amount
 * @returns {number} - Final total
 */
export const calculateTotal = ({
  subtotal,
  discountAmount
}) => {
  return subtotal - discountAmount;
};

/**
 * Distribute quantities into dozen and unit pricing
 * @param {Array} sizes - Array of size objects with quantities
 * @param {number} totalDozenQty - Total quantity eligible for dozen pricing
 * @returns {Array} - Array of size objects with dozen and unit quantities
 */
export const distributeDozenPricing = (sizes, totalDozenQty) => {
  let remainingDozenQty = totalDozenQty;
  
  // Sort sizes by additional price (ascending)
  const sortedSizes = [...sizes].sort((a, b) => 
    (a.additionalPrice || 0) - (b.additionalPrice || 0)
  );
  
  // First pass: distribute dozen pricing
  const result = [];
  
  for (const size of sortedSizes) {
    const dozenQty = Math.min(size.quantity, remainingDozenQty);
    const unitQty = size.quantity - dozenQty;
    remainingDozenQty -= dozenQty;
    
    // Add dozen pricing items
    if (dozenQty > 0) {
      result.push({
        ...size,
        quantity: dozenQty,
        dozenQuantity: dozenQty,
        unitQuantity: 0,
        priceType: 'dozen'
      });
    }
    
    // Add unit pricing items
    if (unitQty > 0) {
      result.push({
        ...size,
        quantity: unitQty,
        dozenQuantity: 0,
        unitQuantity: unitQty,
        priceType: 'unit'
      });
    }
  }
  
  return result;
};

/**
 * Calculate complete price breakdown
 * NOTE: This function should match the backend's calculateItemPrice logic for consistency
 * For most accurate pricing, consider using the calculatePrice API function above
 * 
 * @param {Object} params
 * @param {Array} params.sizeBreakdown - Array of size quantities
 * @param {Object} params.product - Product details
 * @param {Object} params.material - Selected material
 * @param {Object} params.customDesign - Custom design details (optional)
 * @returns {Object} - Complete price breakdown
 */
export const calculatePriceBreakdown = ({
  sizeBreakdown,
  product,
  material,
  customDesign
}) => {
  if (!product || !sizeBreakdown || !Array.isArray(sizeBreakdown)) {
    return {
      subtotal: 0,
      total: 0,
      sizeDetails: [],
      totalQuantity: 0,
      totalDozens: 0
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
      priceType: size.dozenQty > 0 ? (size.unitQty > 0 ? 'mixed' : 'dozen') : 'unit',
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
 * Format price details for display
 * @param {Object} priceDetails - Price breakdown details
 * @returns {Object} - Formatted price details for display
 */
export const formatPriceDetails = (priceDetails) => {
  return {
    ...priceDetails,
    formattedSubtotal: formatCurrency(priceDetails.subtotal),
    formattedDiscountAmount: formatCurrency(priceDetails.discountAmount),
    formattedTotal: formatCurrency(priceDetails.total),
    formattedCustomDesignFee: formatCurrency(priceDetails.customDesignFee),
    sizeDetails: priceDetails.sizeDetails.map(detail => ({
      ...detail,
      formattedPricePerUnit: formatCurrency(detail.pricePerUnit),
      formattedSubtotal: formatCurrency(detail.subtotal)
    }))
  };
};