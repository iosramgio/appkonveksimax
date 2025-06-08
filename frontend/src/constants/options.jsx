// Size options
export const SIZE_OPTIONS = [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: '2XL', label: '2XL' },
    { value: '3XL', label: '3XL' },
    { value: '4XL', label: '4XL' },
    { value: '5XL', label: '5XL' }
  ];
  
  // Role options
  export const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin' },
    { value: 'cashier', label: 'Kasir' },
    { value: 'staff', label: 'Staf' },
    { value: 'owner', label: 'Owner' },
    { value: 'customer', label: 'Customer' }
  ];
  
  // Order status options
  export const ORDER_STATUS_OPTIONS = [
    { value: 'Pesanan Diterima', label: 'Pesanan Diterima' },
    { value: 'Diproses', label: 'Diproses' },
    { value: 'Selesai Produksi', label: 'Selesai Produksi' },
    { value: 'Siap Kirim', label: 'Siap Kirim' },
    { value: 'Selesai', label: 'Selesai' }
  ];
  
  // Payment status options
  export const PAYMENT_STATUS_OPTIONS = [
    { value: 'Belum Bayar', label: 'Belum Bayar' },
    { value: 'DP', label: 'Down Payment (DP)' },
    { value: 'Lunas', label: 'Lunas' }
  ];
  
  // Payment method options
  export const PAYMENT_METHOD_OPTIONS = [
    { value: 'bank_transfer', label: 'Transfer Bank' },
    { value: 'va', label: 'Virtual Account' },
    { value: 'qris', label: 'QRIS' },
    { value: 'cash', label: 'Tunai' }
  ];
  
  // Delivery method options
  export const DELIVERY_METHOD_OPTIONS = [
    { value: 'Ambil Sendiri', label: 'Ambil Sendiri' },
    { value: 'Dikirim', label: 'Dikirim' }
  ];
  
  // Report period options
  export const REPORT_PERIOD_OPTIONS = [
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'yearly', label: 'Tahunan' }
  ];
  
  // Filter options
  export const FILTER_ALL_OPTION = { value: 'all', label: 'Semua' };
  
  export default {
    SIZE_OPTIONS,
    ROLE_OPTIONS,
    ORDER_STATUS_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    PAYMENT_METHOD_OPTIONS,
    DELIVERY_METHOD_OPTIONS,
    REPORT_PERIOD_OPTIONS,
    FILTER_ALL_OPTION
  };