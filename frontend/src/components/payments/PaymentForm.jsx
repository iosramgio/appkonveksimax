import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import { formatCurrency } from '../../utils/formatter';

const PaymentForm = ({ order, onSubmit, onClose, paymentType = 'full', isRemainingPayment = false, isDownPayment = false }) => {
  const [formData, setFormData] = useState({
    method: 'cash',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const paymentAmount = isRemainingPayment 
    ? order.paymentDetails.remainingPayment.amount 
    : isDownPayment
      ? order.paymentDetails.downPayment.amount
      : order.paymentDetails.total;

  const paymentTitle = isRemainingPayment 
    ? 'Pelunasan Pesanan' 
    : isDownPayment
      ? 'Pembayaran DP Pesanan'
      : 'Pembayaran Pesanan';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        amount: paymentAmount,
        isRemainingPayment,
        isDownPayment
      });
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Tunai' },
    { value: 'transfer', label: 'Transfer Bank' }
  ];

  return (
    <Modal 
      isOpen={true}
      onClose={onClose}
      title={paymentTitle}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Nomor Pesanan:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Jumlah Pembayaran:</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(paymentAmount)}</span>
            </div>
            {isRemainingPayment && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Detail Pembayaran:</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">DP (Sudah Dibayar):</span>
                  <span className="text-sm font-medium">{formatCurrency(order.paymentDetails.downPayment.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sisa Pembayaran:</span>
                  <span className="text-sm font-medium">{formatCurrency(order.paymentDetails.remainingPayment.amount)}</span>
                </div>
              </div>
            )}
            {isDownPayment && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Detail Pembayaran DP:</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Jumlah DP ({order.paymentDetails.downPayment.percentage}%):</span>
                  <span className="text-sm font-medium">{formatCurrency(order.paymentDetails.downPayment.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sisa Pembayaran (nanti):</span>
                  <span className="text-sm font-medium">{formatCurrency(order.paymentDetails.remainingPayment.amount)}</span>
                </div>
              </div>
            )}
          </div>

          <SelectField
            label="Metode Pembayaran"
            name="method"
            value={formData.method}
            onChange={handleChange}
            options={paymentMethods}
            required
          />

          <InputField
            label="Catatan"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Tambahkan catatan pembayaran (opsional)"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            label="Batal"
            variant="secondary"
            onClick={onClose}
          />
          <Button
            type="submit"
            label={isRemainingPayment 
              ? "Proses Pelunasan" 
              : isDownPayment 
                ? "Proses Pembayaran DP" 
                : "Proses Pembayaran"
            }
            loading={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default PaymentForm; 