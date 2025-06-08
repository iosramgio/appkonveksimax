import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import InputField from '../../components/forms/InputField';
import SelectField from '../../components/forms/SelectField';
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { ORDER_STATUS_OPTIONS, FILTER_ALL_OPTION } from '../../constants/options';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  const fetchPayments = async (page = 1, status = 'pending') => {
    setLoading(true);
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('status', status);
      
      // Add payment type filter if not 'all'
      if (paymentTypeFilter !== 'all') {
        queryParams.append('paymentType', paymentTypeFilter);
      }
      
      // Add order status filter if not 'all'
      if (orderStatusFilter !== 'all') {
        queryParams.append('orderStatus', orderStatusFilter);
      }
      
      // Add date filter if not 'all'
      if (dateFilter !== 'all') {
        const today = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
          default:
            break;
        }
        
        queryParams.append('startDate', startDate.toISOString());
        queryParams.append('endDate', today.toISOString());
      }
      
      // Add search query if exists
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery);
      }
      
      const response = await api.get(`/payments?${queryParams.toString()}`);
      
      // Display the payment status for easier troubleshooting
      console.log('Payments data:', response.data.payments.map(p => ({
        orderId: p.order?._id,
        orderNumber: p.order?.orderNumber,
        orderStatus: p.order?.status,
        isPaid: p.order?.paymentDetails?.isPaid,
        paymentType: p.paymentType,
        downPaymentStatus: p.order?.paymentDetails?.downPayment?.status,
        paymentAmount: p.amount,
        paymentStatus: p.status
      })));
      
      // Check for any duplicates in the response (should be handled by backend now)
      const orderIds = new Set();
      const uniquePayments = response.data.payments.filter(payment => {
        if (!payment.order || !payment.order._id) return false;
        
        const orderId = payment.order._id;
        if (orderIds.has(orderId)) {
          console.warn(`Duplicate order found: ${payment.order.orderNumber}`);
          return false;
        }
        
        orderIds.add(orderId);
        return true;
      });
      
      if (uniquePayments.length !== response.data.payments.length) {
        console.warn(`Filtered ${response.data.payments.length - uniquePayments.length} duplicate payments`);
      }
      
      setPayments(uniquePayments);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(response.data.pagination.page);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showNotification('Gagal memuat daftar pembayaran', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPayments(1, statusFilter);
  }, [statusFilter]);
  
  const handlePageChange = (page) => {
    fetchPayments(page, statusFilter);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
    fetchPayments(1, e.target.value);
  };
  
  const handlePaymentTypeFilterChange = (e) => {
    setPaymentTypeFilter(e.target.value);
    setCurrentPage(1);
    fetchPayments(1, statusFilter);
  };
  
  const handleOrderStatusFilterChange = (e) => {
    setOrderStatusFilter(e.target.value);
    setCurrentPage(1);
    fetchPayments(1, statusFilter);
  };
  
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
    fetchPayments(1, statusFilter);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments(1, statusFilter);
  };
  
  const handleVerifyClick = (payment) => {
    setSelectedPayment(payment);
    setVerificationNote('');
    setShowVerifyModal(true);
  };
  
  const handleVerifyConfirm = async () => {
    if (!selectedPayment) return;
    
    setVerifyLoading(true);
    
    try {
      // First check if the user is authenticated
      const tokenCheck = sessionStorage.getItem('token');
      if (!tokenCheck) {
        showNotification('Sesi anda telah berakhir. Silakan login kembali.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const response = await api.post(`/payments/verify/${selectedPayment._id}`, {
        status: 'verified',
        note: verificationNote || 'Pembayaran telah diverifikasi'
      });
      
      showNotification('Pembayaran berhasil diverifikasi', 'success');
      
      // Update the order in the list with the new verification status
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment._id === selectedPayment._id 
            ? { ...payment, status: 'paid', order: response.data.order }
            : payment
        )
      );
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // Show more detailed error message
      const errorMsg = error.response?.data?.message || 'Gagal memverifikasi pembayaran. Silakan coba lagi.';
      showNotification(errorMsg, 'error');
    } finally {
      setVerifyLoading(false);
      setShowVerifyModal(false);
      setSelectedPayment(null);
    }
  };
  
  const handleRejectClick = (payment) => {
    setSelectedPayment(payment);
    setRejectionNote('');
    setShowRejectModal(true);
  };
  
  const handleRejectConfirm = async () => {
    if (!selectedPayment) return;
    
    setRejectLoading(true);
    
    try {
      // First check if the user is authenticated
      const tokenCheck = sessionStorage.getItem('token');
      if (!tokenCheck) {
        showNotification('Sesi anda telah berakhir. Silakan login kembali.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      const response = await api.post(`/payments/verify/${selectedPayment._id}`, {
        status: 'rejected',
        note: rejectionNote || 'Pembayaran ditolak'
      });
      
      showNotification('Pembayaran telah ditolak', 'success');
      
      // Update the order in the list with the new verification status
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment._id === selectedPayment._id 
            ? { ...payment, status: 'failed', order: response.data.order }
            : payment
        )
      );
    } catch (error) {
      console.error('Error rejecting payment:', error);
      
      // Show more detailed error message
      const errorMsg = error.response?.data?.message || 'Gagal menolak pembayaran. Silakan coba lagi.';
      showNotification(errorMsg, 'error');
    } finally {
      setRejectLoading(false);
      setShowRejectModal(false);
      setSelectedPayment(null);
    }
  };
  
  const handleShowReceipt = (receiptUrl) => {
    setReceiptUrl(receiptUrl);
    setShowReceiptModal(true);
  };
  
  const statusOptions = [
    { value: 'pending', label: 'Menunggu Verifikasi' },
    { value: 'paid', label: 'Terverifikasi' },
    { value: 'failed', label: 'Ditolak' },
    { value: 'all', label: 'Semua Status' }
  ];
  
  const paymentTypeOptions = [
    FILTER_ALL_OPTION,
    { value: 'downPayment', label: 'Uang Muka (DP)' },
    { value: 'remainingPayment', label: 'Pelunasan' },
    { value: 'fullPayment', label: 'Pembayaran Penuh' }
  ];
  
  const orderStatusOptions = [
    FILTER_ALL_OPTION,
    ...ORDER_STATUS_OPTIONS
  ];
  
  const dateOptions = [
    { value: 'all', label: 'Semua Waktu' },
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: '7 Hari Terakhir' },
    { value: 'month', label: '30 Hari Terakhir' }
  ];
  
  // Helper untuk menampilkan status pembayaran
  const getPaymentStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'expired': 'bg-red-100 text-red-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };
    
    const statusLabels = {
      'pending': 'Menunggu Verifikasi',
      'paid': 'Terverifikasi',
      'expired': 'Kadaluarsa',
      'failed': 'Ditolak',
      'refunded': 'Dikembalikan'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };
  
  // Helper untuk menampilkan status pesanan
  const getOrderStatusBadge = (status) => {
    const statusClasses = {
      'Pesanan Diterima': 'bg-blue-100 text-blue-800',
      'Diproses': 'bg-yellow-100 text-yellow-800',
      'Selesai Produksi': 'bg-green-100 text-green-800',
      'Siap Kirim': 'bg-purple-100 text-purple-800',
      'Selesai': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {formatOrderStatus(status)}
      </span>
    );
  };
  
  const columns = [
    {
      header: 'ID Pesanan',
      accessor: 'order.orderNumber',
      cell: (row) => (
        <Link 
          to={`/cashier/orders/${row.order?._id}`} 
          className="text-blue-600 hover:underline"
        >
          #{row.order?.orderNumber || 'N/A'}
        </Link>
      )
    },
    {
      header: 'Pelanggan',
      accessor: 'order.customer.name',
      cell: (row) => row.order?.customer?.name || 'N/A'
    },
    {
      header: 'Jumlah',
      accessor: 'amount',
      cell: (row) => formatCurrency(row.amount)
    },
    {
      header: 'Tipe',
      accessor: 'paymentType',
      cell: (row) => (
        <div>
          {row.paymentType === 'downPayment' && (
            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Uang Muka (DP)</span>
          )}
          {row.paymentType === 'remainingPayment' && (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              {row.order?.paymentDetails?.isPaid ? 'Pelunasan' : 'Sisa Pembayaran'}
            </span>
          )}
          {row.paymentType === 'fullPayment' && (
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Pembayaran Penuh</span>
          )}
        </div>
      )
    },
    {
      header: 'Status Pesanan',
      accessor: 'order.status',
      cell: (row) => (
        row.order?.status && getOrderStatusBadge(row.order.status)
      )
    },
    {
      header: 'Status Pembayaran',
      accessor: 'status',
      cell: (row) => getPaymentStatusBadge(row.status)
    },
    {
      header: 'Bukti',
      accessor: 'receiptUrl',
      cell: (row) => (
        row.receiptUrl ? (
          <button
            onClick={() => handleShowReceipt(row.receiptUrl)}
            className="text-blue-600 hover:underline"
          >
            Lihat Bukti
          </button>
        ) : (
          <span className="text-gray-500">-</span>
        )
      )
    },
    {
      header: 'Tanggal',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Aksi',
      accessor: '_id',
      cell: (row) => {
        if (row.status === 'pending') {
          return (
            <div className="flex space-x-2">
              <Button
                label="Verifikasi"
                size="sm"
                variant="success"
                onClick={() => handleVerifyClick(row)}
              />
              <Button
                label="Tolak"
                size="sm"
                variant="danger"
                onClick={() => handleRejectClick(row)}
              />
            </div>
          );
        }
        
        return null;
      }
    }
  ];
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Verifikasi Pembayaran</h1>
        <div className="flex space-x-3 items-center">
          <Button
            label="Refresh"
            variant="secondary"
            onClick={() => fetchPayments(currentPage, statusFilter)}
            isLoading={loading}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            }
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari nomor pesanan atau pelanggan..."
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cari
              </button>
            </form>
          </div>
          
          <SelectField
            label="Status Pembayaran"
            name="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
          />
          
          <SelectField
            label="Tipe Pembayaran"
            name="paymentTypeFilter"
            value={paymentTypeFilter}
            onChange={handlePaymentTypeFilterChange}
            options={paymentTypeOptions}
          />
          
          <SelectField
            label="Status Pesanan"
            name="orderStatusFilter"
            value={orderStatusFilter}
            onChange={handleOrderStatusFilterChange}
            options={orderStatusOptions}
          />
          
          <SelectField
            label="Filter Tanggal"
            name="dateFilter"
            value={dateFilter}
            onChange={handleDateFilterChange}
            options={dateOptions}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table
          columns={columns}
          data={payments}
          loading={loading}
        />
        
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-center">
            <nav className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
      
      {/* Verify Payment Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verifikasi Pembayaran"
        size="md"
      >
        <div className="space-y-4">
          <p>Apakah Anda yakin ingin memverifikasi pembayaran ini?</p>
          {selectedPayment && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">ID Pesanan:</span> #{selectedPayment.order?.orderNumber}
                </div>
                <div>
                  <span className="font-medium">Pelanggan:</span> {selectedPayment.order?.customer?.name}
                </div>
                <div>
                  <span className="font-medium">Jumlah:</span> {formatCurrency(selectedPayment.amount)}
                </div>
                <div>
                  <span className="font-medium">Status Pesanan:</span> {formatOrderStatus(selectedPayment.order?.status)}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Tipe Pembayaran:</span> {
                    selectedPayment.paymentType === 'downPayment' ? 'Uang Muka (DP)' :
                    selectedPayment.paymentType === 'remainingPayment' ? 'Pelunasan' : 
                    'Pembayaran Penuh'
                  }
                </div>
              </div>
            </div>
          )}
          
          <InputField
            label="Catatan Verifikasi (Opsional)"
            name="verificationNote"
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
            placeholder="Tambahkan catatan verifikasi jika diperlukan"
            multiline
            rows={3}
          />
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button
            label="Batal"
            variant="secondary"
            onClick={() => setShowVerifyModal(false)}
          />
          <Button
            label="Verifikasi"
            variant="success"
            onClick={handleVerifyConfirm}
            isLoading={verifyLoading}
          />
        </div>
      </Modal>
      
      {/* Reject Payment Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Tolak Pembayaran"
        size="md"
      >
        <div className="space-y-4">
          <p>Apakah Anda yakin ingin menolak pembayaran ini?</p>
          {selectedPayment && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">ID Pesanan:</span> #{selectedPayment.order?.orderNumber}
                </div>
                <div>
                  <span className="font-medium">Pelanggan:</span> {selectedPayment.order?.customer?.name}
                </div>
                <div>
                  <span className="font-medium">Jumlah:</span> {formatCurrency(selectedPayment.amount)}
                </div>
                <div>
                  <span className="font-medium">Status Pesanan:</span> {formatOrderStatus(selectedPayment.order?.status)}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Tipe Pembayaran:</span> {
                    selectedPayment.paymentType === 'downPayment' ? 'Uang Muka (DP)' :
                    selectedPayment.paymentType === 'remainingPayment' ? 'Pelunasan' : 
                    'Pembayaran Penuh'
                  }
                </div>
              </div>
            </div>
          )}
          
          <InputField
            label="Alasan Penolakan"
            name="rejectionNote"
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            placeholder="Masukkan alasan penolakan pembayaran"
            multiline
            rows={3}
            required
          />
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button
            label="Batal"
            variant="secondary"
            onClick={() => setShowRejectModal(false)}
          />
          <Button
            label="Tolak"
            variant="danger"
            onClick={handleRejectConfirm}
            isLoading={rejectLoading}
          />
        </div>
      </Modal>
      
      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Bukti Pembayaran"
        size="lg"
      >
        <div className="flex justify-center">
          <img
            src={receiptUrl}
            alt="Bukti Pembayaran"
            className="max-w-full max-h-96 object-contain"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            label="Tutup"
            variant="secondary"
            onClick={() => setShowReceiptModal(false)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PaymentVerification;