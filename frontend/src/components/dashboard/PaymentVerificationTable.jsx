import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';
import InputField from '../forms/InputField';
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const PaymentVerificationTable = ({ payments, onPaymentVerified = () => {} }) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const api = useApi();
  const { showNotification } = useNotification();
  
  // Deteksi ukuran layar untuk responsif
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
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
      onPaymentVerified(selectedPayment._id, 'verified', response.data.order);
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
      onPaymentVerified(selectedPayment._id, 'rejected', response.data.order);
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
      'failed': 'Gagal',
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

  if (!payments || payments.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Verifikasi Pembayaran</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Tidak ada pembayaran yang menunggu verifikasi</p>
        </div>
      </div>
    );
  }

  // Tampilan untuk mobile
  if (isMobile) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Verifikasi Pembayaran</h2>
          <Link to="/cashier/payments" className="text-blue-600 hover:text-blue-800 text-sm">
            Lihat Semua
          </Link>
        </div>
        
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <Link 
                  to={`/cashier/orders/${payment.order?._id}`} 
                  className="text-blue-600 hover:underline font-medium"
                >
                  #{payment.order?.orderNumber || 'N/A'}
                </Link>
                {getPaymentStatusBadge(payment.status)}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {payment.order?.customer?.name || 'N/A'}
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{formatCurrency(payment.amount)}</div>
                <div>
                  {payment.paymentType === 'downPayment' && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Uang Muka (DP)</span>
                  )}
                  {payment.paymentType === 'remainingPayment' && (
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      {payment.order?.paymentDetails?.isPaid ? 'Pelunasan' : 'Sisa Pembayaran'}
                    </span>
                  )}
                  {payment.paymentType === 'fullPayment' && (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Pembayaran Penuh</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs text-gray-500">{formatDate(payment.createdAt)}</div>
                {payment.order?.status && getOrderStatusBadge(payment.order.status)}
              </div>
              
              <div className="flex justify-between items-center">
                {payment.receiptUrl ? (
                  <button
                    onClick={() => handleShowReceipt(payment.receiptUrl)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Lihat Bukti
                  </button>
                ) : (
                  <span className="text-gray-500 text-sm">Tidak ada bukti</span>
                )}
                
                {payment.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      label="Verifikasi"
                      size="xs"
                      variant="success"
                      onClick={() => handleVerifyClick(payment)}
                    />
                    <Button
                      label="Tolak"
                      size="xs"
                      variant="danger"
                      onClick={() => handleRejectClick(payment)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Modals */}
        {/* Verify Modal */}
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
                    <span className="font-medium">Status Pesanan:</span> {selectedPayment.order?.status}
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
              label="Catatan (Opsional)"
              placeholder="Tambahkan catatan verifikasi"
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              multiline
              rows={3}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
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

        {/* Reject Modal */}
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
                    <span className="font-medium">Status Pesanan:</span> {selectedPayment.order?.status}
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
              placeholder="Masukkan alasan penolakan"
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              multiline
              rows={3}
              required
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
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
  }

  // Tampilan untuk desktop
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Verifikasi Pembayaran</h2>
        <Link to="/cashier/payments" className="text-blue-600 hover:text-blue-800 text-sm">
          Lihat Semua
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pesanan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Pesanan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Pembayaran
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bukti
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link 
                      to={`/cashier/orders/${payment.order?._id}`} 
                      className="text-blue-600 hover:underline"
                    >
                      #{payment.order?.orderNumber || 'N/A'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {payment.order?.customer?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {payment.paymentType === 'downPayment' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Uang Muka (DP)</span>
                    )}
                    {payment.paymentType === 'remainingPayment' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                        {payment.order?.paymentDetails?.isPaid ? 'Pelunasan' : 'Sisa Pembayaran'}
                      </span>
                    )}
                    {payment.paymentType === 'fullPayment' && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Pembayaran Penuh</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {payment.order?.status && getOrderStatusBadge(payment.order.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getPaymentStatusBadge(payment.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {payment.receiptUrl ? (
                      <button
                        onClick={() => handleShowReceipt(payment.receiptUrl)}
                        className="text-blue-600 hover:underline"
                      >
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-left">
                    {payment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          label="Verifikasi"
                          size="xs"
                          variant="success"
                          onClick={() => handleVerifyClick(payment)}
                        />
                        <Button
                          label="Tolak"
                          size="xs"
                          variant="danger"
                          onClick={() => handleRejectClick(payment)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verify Modal */}
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
                  <span className="font-medium">Status Pesanan:</span> {selectedPayment.order?.status}
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
            label="Catatan (Opsional)"
            placeholder="Tambahkan catatan verifikasi"
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
            multiline
            rows={3}
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
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

      {/* Reject Modal */}
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
                  <span className="font-medium">Status Pesanan:</span> {selectedPayment.order?.status}
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
            placeholder="Masukkan alasan penolakan"
            value={rejectionNote}
            onChange={(e) => setRejectionNote(e.target.value)}
            multiline
            rows={3}
            required
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
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

export default PaymentVerificationTable; 