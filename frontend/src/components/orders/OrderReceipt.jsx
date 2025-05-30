import React from 'react';
import { formatCurrency } from '../../utils/formatter';

const OrderReceipt = React.forwardRef(({ order, showPrintButton = true }, ref) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={ref} className="p-4 bg-white max-w-2xl mx-auto print:p-0">
      {/* Print button - hidden when printing */}
      {showPrintButton && (
        <div className="mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Cetak Struk
          </button>
        </div>
      )}

      {/* Receipt content */}
      <div className="border-2 border-gray-200 p-6 print:border-0 print:p-0">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">KONVEKSI</h1>
          <p className="text-gray-600">Jl. Contoh No. 123, Kota</p>
          <p className="text-gray-600">Telp: (021) 1234567</p>
        </div>

        {/* Order details */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>No. Struk:</span>
            <span>{order.paymentDetails?.receiptNumber || order.orderNumber}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tanggal:</span>
            <span>{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Kasir:</span>
            <span>{order.createdBy?.name || 'Admin'}</span>
          </div>
        </div>

        {/* Customer details */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Detail Pelanggan:</h2>
          <p>Nama: {order.customer.name}</p>
          <p>Telepon: {order.customer.phone}</p>
          {order.deliveryMethod === 'Dikirim' && (
            <p>Alamat: {order.deliveryAddress}</p>
          )}
        </div>

        {/* Order items */}
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Detail Pesanan:</h2>
          <div className="border-t border-b border-gray-200 py-2">
            {order.items.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between">
                  <span className="font-medium">{item.product.name}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Warna: {item.color}</p>
                  <p>Bahan: {item.material}</p>
                  <p>Ukuran: {item.size}</p>
                  <p>Jumlah: {item.quantity} x {formatCurrency(item.price)}</p>
                  {item.customDesign && (
                    <p>Biaya Desain: {formatCurrency(item.customDesign.designFee)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment details */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.paymentDetails.subtotal)}</span>
          </div>
          {order.paymentDetails.discount > 0 && (
            <div className="flex justify-between mb-2">
              <span>Diskon:</span>
              <span>-{formatCurrency(order.paymentDetails.discount)}</span>
            </div>
          )}
          {order.paymentDetails.customFees > 0 && (
            <div className="flex justify-between mb-2">
              <span>Biaya Custom:</span>
              <span>{formatCurrency(order.paymentDetails.customFees)}</span>
            </div>
          )}
          <div className="flex justify-between mb-2 font-bold">
            <span>Total:</span>
            <span>{formatCurrency(order.paymentDetails.total)}</span>
          </div>
          
          {order.paymentDetails.status === 'DP' ? (
            <>
              <div className="flex justify-between mb-2">
                <span>DP ({order.paymentDetails.downPayment.percentage}%):</span>
                <span>{formatCurrency(order.paymentDetails.downPayment.amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Sisa Pembayaran:</span>
                <span>{formatCurrency(order.paymentDetails.remainingPayment.amount)}</span>
              </div>
            </>
          ) : null}
          
          {order.paymentDetails.method === 'Tunai' && (
            <>
              <div className="flex justify-between mb-2">
                <span>Tunai:</span>
                <span>{formatCurrency(order.paymentDetails.cashReceived)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Kembalian:</span>
                <span>{formatCurrency(order.paymentDetails.changeAmount)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm">
          <p className="mb-2">Terima kasih telah berbelanja</p>
          <p>Simpan struk ini sebagai bukti pembayaran</p>
          {order.estimatedCompletionDate && (
            <p className="mt-2">
              Estimasi Selesai: {new Date(order.estimatedCompletionDate).toLocaleDateString('id-ID')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

OrderReceipt.displayName = 'OrderReceipt';

export default OrderReceipt; 