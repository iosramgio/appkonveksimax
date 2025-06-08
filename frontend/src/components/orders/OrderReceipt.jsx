import React from 'react';
import { formatCurrency } from '../../utils/formatter';
import html2pdf from 'html2pdf.js';

// Definisikan styles sebagai string
const globalStyles = `
  /* Webkit browsers (Chrome, Safari) */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 0 0 1rem 0;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #cdcdcd;
  }

  /* Firefox */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #ddd #f1f1f1;
  }

  /* Hide scrollbar when printing */
  @media print {
    .overflow-y-auto::-webkit-scrollbar {
      display: none;
    }
    .overflow-y-auto {
      scrollbar-width: none;
    }
  }
`;

const OrderReceipt = ({ order, onPrint }) => {
  if (!order) return null;

  console.log('Order Data:', order); // Debugging line untuk melihat struktur order

  const generatePDF = () => {
    const element = document.getElementById('receipt-content');
    
    const contentHeight = element.scrollHeight;
    
    const opt = {
      margin: [10, 10, 10, 10], // Margin yang lebih kecil untuk nota
      filename: `nota-${order.orderNumber}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        width: 595 // Lebar untuk ukuran nota (setara dengan 158mm)
      },
      jsPDF: { 
        unit: 'mm',
        format: [158, Math.max(220, (contentHeight * 0.264583))], // Ukuran nota standar
        orientation: 'portrait',
        compress: true
      }
    };

    element.classList.add('pdf-mode');
    
    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove('pdf-mode');
    });
  };

  // Format tanggal dengan opsi yang lebih lengkap
  const formatDetailDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format status pembayaran
  const getPaymentStatusText = (order) => {
    if (order.paymentDetails?.isPaid) {
      return 'LUNAS';
    } else if (order.paymentDetails?.downPayment?.status === 'paid') {
      return 'DP TERBAYAR';
    } else {
      return 'BELUM BAYAR';
    }
  };

  // Get payment status color class
  const getPaymentStatusClass = (order) => {
    if (order.paymentDetails?.isPaid) {
      return 'text-green-600';
    } else if (order.paymentDetails?.downPayment?.status === 'paid') {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  // Tambahkan fungsi helper untuk menghitung total kuantitas
  const calculateTotalQuantity = (items) => {
    return items.reduce((total, item) => {
      return total + (item.totalQuantity || item.quantity || 0);
    }, 0);
  };

  // Fungsi untuk menghitung jumlah lusin
  const calculateDozenCount = (totalQty) => {
    const dozens = Math.floor(totalQty / 12);
    const remaining = totalQty % 12;
    if (dozens === 0) return '';
    return `${dozens} lusin${remaining > 0 ? ` + ${remaining} pcs` : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative flex flex-col max-h-[90vh]">
        {/* Header with Buttons */}
        <div className="sticky top-0 bg-white z-10 p-4 border-b rounded-t-2xl flex justify-between items-center no-print">
          <h1 className="text-xl font-bold">Nota Pembelian #{order.orderNumber}</h1>
          <div className="flex gap-2">
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
          <button
              onClick={onPrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto rounded-b-2xl">
          <div className="p-6">
            {/* Receipt Content */}
            <div id="receipt-content" className="bg-white space-y-4 w-full max-w-[138mm] mx-auto">
              {/* Company Logo & Header */}
              <div className="text-center border-b pb-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">NOTA PEMBELIAN</h1>
                  <div className="flex justify-center">
                    <img 
                      src="/assets/images/bg-nota.png" 
                      alt="Konveksi Anda Logo" 
                      className="h-10 w-auto object-contain" 
                      style={{
                        maxWidth: '200px'
                      }}
                    />
                  </div>
                </div>
                <div className="text-gray-600">
                
                  <p>Telp: (+62) 857-7201-9969 | WhatsApp: 0857-7201-9969</p>
                  <p>Email: info@maxsupply.com</p>
          </div>
          </div>

              {/* Order & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h2 className="font-semibold text-gray-900 mb-3 text-lg">Informasi Pesanan</h2>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">No. Pesanan:</span> #{order.orderNumber}</p>
                    <p><span className="text-gray-600">Tanggal:</span> {formatDetailDate(order.createdAt)}</p>
                    <p><span className="text-gray-600">Status:</span> {order.status}</p>
                    <p><span className="text-gray-600">Metode Order:</span> {order.isOfflineOrder ? 'Offline' : 'Online'}</p>
                    {order.verificationStatus && (
                      <p><span className="text-gray-600">Status Verifikasi:</span> {order.verificationStatus}</p>
                    )}
          </div>
        </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h2 className="font-semibold text-gray-900 mb-3 text-lg">Informasi Pelanggan</h2>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Nama:</span> {order.customer?.name}</p>
                    <p><span className="text-gray-600">Telepon:</span> {order.customer?.phone}</p>
                    {order.customer?.email && (
                      <p><span className="text-gray-600">Email:</span> {order.customer?.email}</p>
                    )}
                    {order.address && (
                      <p><span className="text-gray-600">Alamat:</span> {order.address}</p>
                    )}
                    {order.shippingAddress && !order.address && (
                      <p>
                        <span className="text-gray-600">Alamat:</span>{' '}
                        {`${order.shippingAddress.street}, ${order.shippingAddress.district ? order.shippingAddress.district + ', ' : ''}${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}`}
                      </p>
                    )}
                  </div>
                </div>
        </div>

              {/* Shipping Info if applicable */}
              {order.deliveryMethod === 'Dikirim' && order.shippingAddress && (
                <div className="border-b pb-6">
                  <h2 className="font-semibold text-gray-900 mb-3 text-lg">Informasi Pengiriman</h2>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Alamat:</span> {order.shippingAddress.street}</p>
                      {order.shippingAddress.district && (
                        <p><span className="text-gray-600">Kecamatan:</span> {order.shippingAddress.district}</p>
                      )}
                      <p><span className="text-gray-600">Kota:</span> {order.shippingAddress.city}</p>
                      <p><span className="text-gray-600">Provinsi:</span> {order.shippingAddress.province}</p>
                      <p><span className="text-gray-600">Kode Pos:</span> {order.shippingAddress.postalCode}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-b pb-6">
                <h2 className="font-semibold text-gray-900 mb-3 text-lg">Ringkasan Pesanan</h2>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-600">Total Kuantitas:</span>{' '}
                      {calculateTotalQuantity(order.items)} pcs
                    </p>
                    <p>
                      <span className="text-gray-600">Harga Lusin:</span>{' '}
                      {calculateDozenCount(calculateTotalQuantity(order.items))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Detail */}
              <div className="border-b pb-6">
                <h2 className="font-semibold text-gray-900 mb-3 text-lg">Detail Produk</h2>
                {order.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl overflow-hidden mb-4 last:mb-0">
                    <div className="p-4 bg-gray-100 border-b">
                      <h3 className="font-medium text-lg">{item.productName || item.productDetails?.name}</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Ukuran & Material</th>
                            <th className="text-center py-2">Kuantitas</th>
                            <th className="text-right py-2">Harga Satuan</th>
                            <th className="text-right py-2">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.sizeBreakdown?.map((size, sizeIndex) => {
                            const additionalPrice = size.additionalPrice ? ` (+${formatCurrency(size.additionalPrice)})` : '';
                            const unitPrice = (item.priceDetails?.pricePerUnit || item.unitPrice || 0) + (size.additionalPrice || 0);
                            const subtotal = unitPrice * size.quantity;
                            
                            return (
                              <tr key={sizeIndex} className="border-b last:border-0">
                                <td className="py-2">
                                  <div>
                                    {size.size}{additionalPrice}
                                    <div className="text-sm text-gray-500">
                                      Material: {item.material?.name || item.material || '-'}
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center py-2">
                                  <div>{size.quantity} pcs</div>
                                  {calculateDozenCount(size.quantity) && (
                                    <div className="text-sm text-gray-500">
                                      {calculateDozenCount(size.quantity)}
                                    </div>
                                  )}
                                </td>
                                <td className="text-right py-2">
                                  <div>{formatCurrency(unitPrice)}</div>
                                  <div className="text-sm text-gray-500">per pcs</div>
                                </td>
                                <td className="text-right py-2">{formatCurrency(subtotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t">
                            <td colSpan="3" className="text-right py-2 font-medium">Total:</td>
                            <td className="text-right py-2 font-medium">
                              {formatCurrency(item.priceDetails?.total || item.totalPrice || 0)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>

                      {/* Notes */}
                      {(item.customDesign?.notes || item.notes) && (
                        <div className="mt-4 space-y-2">
                          {item.customDesign?.notes && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <span className="font-medium">Catatan Desain:</span> {item.customDesign.notes}
                            </div>
                          )}
                          {item.notes && (
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <span className="font-medium">Catatan Item:</span> {item.notes}
                            </div>
                          )}
                        </div>
                  )}
                </div>
              </div>
            ))}
          </div>

              {/* Payment Summary */}
              <div className="border-b pb-6">
                <h2 className="font-semibold text-gray-900 mb-3 text-lg">Ringkasan Pembayaran</h2>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal Pesanan:</span>
                      <span>{formatCurrency(order.paymentDetails?.subtotal || 0)}</span>
        </div>

                    {order.paymentDetails?.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon ({order.paymentDetails.discount}%):</span>
                        <span>-{formatCurrency((order.paymentDetails.subtotal * order.paymentDetails.discount) / 100)}</span>
            </div>
          )}
                    
                    {order.paymentDetails?.customFees > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Biaya Custom Design:</span>
              <span>{formatCurrency(order.paymentDetails.customFees)}</span>
            </div>
          )}
                    
                    {order.paymentDetails?.shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Biaya Pengiriman:</span>
                        <span>{formatCurrency(order.paymentDetails.shippingCost)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
                        <span>{formatCurrency(order.paymentDetails?.total || 0)}</span>
                      </div>
                    </div>
                  </div>
          </div>
          
                {/* Payment Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DP Info */}
                  {order.paymentDetails?.downPayment && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-medium mb-2">Uang Muka (DP)</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Persentase DP:</span>
                          <span>{order.paymentDetails.downPayment.percentage || 30}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jumlah DP:</span>
                <span>{formatCurrency(order.paymentDetails.downPayment.amount)}</span>
              </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={order.paymentDetails.downPayment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                            {order.paymentDetails.downPayment.status === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                          </span>
                        </div>
                        {order.paymentDetails.downPayment.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal Pembayaran:</span>
                            <span>{formatDetailDate(order.paymentDetails.downPayment.paidAt)}</span>
                          </div>
                        )}
                        {order.paymentDetails.downPayment.method && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Metode Pembayaran:</span>
                            <span>{order.paymentDetails.downPayment.method}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remaining Payment Info */}
                  {order.paymentDetails?.remainingPayment && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-medium mb-2">Sisa Pembayaran</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jumlah:</span>
                <span>{formatCurrency(order.paymentDetails.remainingPayment.amount)}</span>
              </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={order.paymentDetails.remainingPayment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                            {order.paymentDetails.remainingPayment.status === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                          </span>
                        </div>
                        {order.paymentDetails.remainingPayment.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal Pembayaran:</span>
                            <span>{formatDetailDate(order.paymentDetails.remainingPayment.paidAt)}</span>
                          </div>
                        )}
                        {order.paymentDetails.remainingPayment.method && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Metode Pembayaran:</span>
                            <span>{order.paymentDetails.remainingPayment.method}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Overall Payment Status */}
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status Pembayaran:</span>
                    <span className={getPaymentStatusClass(order)}>{getPaymentStatusText(order)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="border-b pb-6">
                  <h2 className="font-semibold text-gray-900 mb-3 text-lg">Catatan Pesanan</h2>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p>{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Estimated Completion */}
              {order.estimatedCompletionDate && (
                <div className="border-b pb-6">
                  <h2 className="font-semibold text-gray-900 mb-3 text-lg">Estimasi Selesai</h2>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p>{formatDetailDate(order.estimatedCompletionDate)}</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-6">
                <div className="font-medium text-gray-900 mb-2">
                  <p>Terima kasih telah berbelanja di Maxsupply.id</p>
                  <p>Simpan nota ini sebagai bukti pembelian yang sah</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
                  <p>Hubungi kami: 0857-7201-9969 (WhatsApp)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply styles using style tag */}
        <style>{globalStyles}</style>

        {/* Add PDF-specific styles */}
        <style>
          {`
            .pdf-mode {
              font-size: 8pt !important;
              width: 138mm !important;
              margin: 0 auto !important;
              background: white !important;
              padding: 10mm !important;
              box-sizing: border-box !important;
            }

            .pdf-mode h1 {
              font-size: 12pt !important;
              margin: 0 0 0.5rem 0 !important;
              font-weight: 700 !important;
            }

            .pdf-mode h2 {
              font-size: 9pt !important;
              margin: 0 0 0.4rem 0 !important;
              font-weight: 600 !important;
              color: #1F2937 !important;
            }

            .pdf-mode .border-b {
              border-bottom: 1px solid #E5E7EB !important;
              margin: 0 0 0.75rem 0 !important;
              padding: 0 0 0.75rem 0 !important;
            }

            .pdf-mode .grid {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.75rem !important;
              margin: 0 0 0.75rem 0 !important;
            }

            .pdf-mode .bg-gray-50 {
              background-color: #F9FAFB !important;
              border: 1px solid #E5E7EB !important;
              border-radius: 0.25rem !important;
              padding: 0.5rem 0.75rem !important;
              margin: 0 !important;
            }

            .pdf-mode table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 0.75rem 0 !important;
              font-size: 7.5pt !important;
            }

            .pdf-mode table th {
              background-color: #F3F4F6 !important;
              color: #1F2937 !important;
              font-weight: 600 !important;
              text-align: left !important;
              padding: 0.5rem 0.75rem !important;
              border-bottom: 1px solid #E5E7EB !important;
            }

            .pdf-mode table td {
              padding: 0.5rem 0.75rem !important;
              border-bottom: 1px solid #E5E7EB !important;
              color: #374151 !important;
            }

            .pdf-mode table tr:last-child td {
              border-bottom: none !important;
            }

            .pdf-mode table th:first-child,
            .pdf-mode table td:first-child {
              width: 40% !important;
            }

            .pdf-mode table th:nth-child(2),
            .pdf-mode table td:nth-child(2) {
              width: 15% !important;
              text-align: center !important;
            }

            .pdf-mode table th:nth-child(3),
            .pdf-mode table td:nth-child(3) {
              width: 20% !important;
              text-align: right !important;
            }

            .pdf-mode table th:nth-child(4),
            .pdf-mode table td:nth-child(4) {
              width: 25% !important;
              text-align: right !important;
              font-weight: 500 !important;
            }

            .pdf-mode .space-y-4 > * + * {
              margin-top: 0.75rem !important;
            }

            .pdf-mode .flex {
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
              gap: 0.75rem !important;
            }

            .pdf-mode .text-center {
              text-align: center !important;
            }

            .pdf-mode img {
              height: 35px !important;
              width: auto !important;
              object-fit: contain !important;
              margin: 0.5rem auto !important;
              display: block !important;
            }

            .pdf-mode .text-gray-600 {
              color: #4B5563 !important;
            }

            .pdf-mode .font-medium {
              font-weight: 500 !important;
            }

            .pdf-mode .text-sm {
              font-size: 7.5pt !important;
              line-height: 1.3 !important;
            }

            /* Footer styles */
            .pdf-mode .text-center.pt-6 {
              margin-top: 1.5rem !important;
              padding-top: 0.75rem !important;
              border-top: 1px solid #E5E7EB !important;
            }

            .pdf-mode .text-center.pt-6 p {
              margin: 0.25rem 0 !important;
              font-size: 7.5pt !important;
            }

            @media print {
              .pdf-mode {
                transform-origin: top center !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default OrderReceipt; 