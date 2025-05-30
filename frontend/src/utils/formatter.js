import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Format a number as Indonesian Rupiah currency
 * 
 * @param {number} amount - Amount to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const { 
    decimalDigits = 0,
    showSymbol = true,
    compact = false
  } = options;
  
  try {
    // Handle null, undefined, or invalid inputs
    if (amount === null || amount === undefined || isNaN(amount)) {
      return showSymbol ? 'Rp 0' : '0';
    }
    
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
      notation: compact ? 'compact' : 'standard',
      compactDisplay: 'short'
    });
    
    let formatted = formatter.format(amount);
    
    // Remove currency symbol if not needed
    if (!showSymbol) {
      formatted = formatted.replace(/Rp\s?/i, '');
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return showSymbol ? 'Rp 0' : '0';
  }
};

/**
 * Format a date string to a human-readable format
 * 
 * @param {string|Date} date - Date to format
 * @param {boolean} showTime - Whether to show time (default: false)
 * @param {Object} options - Additional options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, showTime = false, options = {}) => {
  const { 
    useIndonesian = true,
    formatStr = 'dd MMM yyyy'
  } = options;
  
  try {
    if (!date) return '-';
    
    // Parse ISO string if needed
    let dateObj = date;
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    }
    
    // Add time to format string if requested
    let fullFormatStr = formatStr;
    if (showTime) {
      fullFormatStr += ' HH:mm';
    }
    
    // Format using date-fns with Indonesian locale if requested
    return format(dateObj, fullFormatStr, {
      locale: useIndonesian ? id : undefined
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format a phone number to a standard format
 * 
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '-';
  
  try {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if this is an Indonesian number
    if (cleaned.startsWith('62') || cleaned.startsWith('0')) {
      // If starts with 0, replace with +62
      if (cleaned.startsWith('0')) {
        return '+62 ' + cleaned.substring(1).replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
      }
      
      // If starts with 62, add + and format
      return '+' + cleaned.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, '$1 $2-$3-$4');
    }
    
    // For other numbers, just group digits
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phoneNumber; // Return original if error
  }
};

/**
 * Format a file size in bytes to human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis if it exceeds max length
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Format a number with thousand separators
 * 
 * @param {number} number - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted number
 */
export const formatNumber = (number, options = {}) => {
  const {
    decimalPlaces = 0,
    useGrouping = true
  } = options;
  
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping
  }).format(number);
};

/**
 * Format an order status to a more readable version
 * 
 * @param {string} status - Order status
 * @returns {string} - Formatted status
 */
export const formatOrderStatus = (status) => {
  if (!status) return '-';
  
  const statusMap = {
    'Pesanan Diterima': 'Pesanan Diterima',
    'Diproses': 'Sedang Diproses',
    'Selesai Produksi': 'Selesai Produksi',
    'Siap Kirim': 'Siap Diambil/Dikirim',
    'Selesai': 'Selesai'
  };
  
  return statusMap[status] || status;
};

/**
 * Format payment status to a more readable version
 * 
 * @param {string} status - Payment status
 * @returns {string} - Formatted status
 */
export const formatPaymentStatus = (status) => {
  if (!status) return '-';
  
  const statusMap = {
    'pending': 'Menunggu Pembayaran',
    'settlement': 'Pembayaran Diterima',
    'capture': 'Pembayaran Diproses',
    'deny': 'Pembayaran Ditolak',
    'cancel': 'Pembayaran Dibatalkan',
    'expire': 'Pembayaran Kadaluarsa',
    'failure': 'Pembayaran Gagal',
    'refund': 'Pembayaran Dikembalikan',
    'partial_refund': 'Sebagian Dikembalikan',
    'authorize': 'Pembayaran Diotorisasi',
    'dp': 'DP Diterima',
    'paid': 'Lunas'
  };
  
  return statusMap[status.toLowerCase()] || status;
};