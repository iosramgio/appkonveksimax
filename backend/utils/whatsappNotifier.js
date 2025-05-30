const axios = require('axios');

/**
 * WhatsApp Notifier
 * Sends WhatsApp notifications to customers using Fonnte API
 */
class WhatsAppNotifier {
  constructor() {
    this.apiKey = process.env.FONNTE_API_KEY;
    this.baseUrl = process.env.FONNTE_API_URL || 'https://api.fonnte.com/send';
    this.sender = process.env.FONNTE_SENDER || '';
  }

  /**
   * Send WhatsApp message
   * @param {string} phone - Recipient phone number with country code (e.g., 628123456789)
   * @param {string} message - Message text
   * @param {Object} options - Additional options (delay, schedule, etc.)
   * @returns {Promise} - API response
   */
  async sendMessage(phone, message, options = {}) {
    try {
      // Clean phone number - remove spaces, dashes, etc.
      const cleanPhone = this._cleanPhoneNumber(phone);
      
      if (!cleanPhone) {
        throw new Error('Invalid phone number');
      }
      
      // Prepare request data
      const data = {
        target: cleanPhone,
        message,
        ...options
      };
      
      // Send request to Fonnte API
      const response = await axios.post(this.baseUrl, data, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      throw error;
    }
  }
  
  /**
   * Clean phone number - remove non-numeric characters and ensure country code
   * @param {string} phone - Phone number
   * @returns {string} - Cleaned phone number
   */
  _cleanPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Ensure it starts with country code
    if (cleaned.startsWith('0')) {
      // Replace leading 0 with 62 (Indonesia)
      cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62') && !cleaned.startsWith('1')) {
      // Add 62 if no country code (default to Indonesia)
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  }
  
  /**
   * Send order confirmation notification
   * @param {Object} order - Order object
   * @param {Object} customer - Customer object with phone number
   * @returns {Promise} - Send message result
   */
  async sendOrderConfirmation(order, customer) {
    const message = `*Konfirmasi Pesanan - ${order.orderNumber}*
    
Halo ${customer.name},

Pesanan Anda telah kami terima dengan detail sebagai berikut:

- No. Pesanan: ${order.orderNumber}
- Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}
- Total: Rp ${order.paymentDetails.total.toLocaleString('id-ID')}
${order.paymentDetails.downPayment.required ? 
`- DP (${order.paymentDetails.downPayment.percentage}%): Rp ${order.paymentDetails.downPayment.amount.toLocaleString('id-ID')}` : ''}

Silahkan lakukan pembayaran sesuai petunjuk yang telah dikirimkan.

Terima kasih telah mempercayakan kebutuhan konveksi Anda kepada kami.`;

    return this.sendMessage(customer.phone, message);
  }
  
  /**
   * Send payment verification notification
   * @param {Object} payment - Payment object
   * @param {Object} order - Order object
   * @param {Object} customer - Customer object with phone number
   * @returns {Promise} - Send message result
   */
  async sendPaymentVerification(payment, order, customer) {
    let paymentType = '';
    if (payment.paymentType === 'downPayment') {
      paymentType = 'Uang Muka (DP)';
    } else if (payment.paymentType === 'remainingPayment') {
      paymentType = 'Pelunasan';
    } else {
      paymentType = 'Pembayaran Penuh';
    }
    
    const message = `*Konfirmasi Pembayaran - ${order.orderNumber}*
    
Halo ${customer.name},

Pembayaran Anda untuk pesanan ${order.orderNumber} telah kami verifikasi dengan detail:

- Jenis Pembayaran: ${paymentType}
- Jumlah: Rp ${payment.amount.toLocaleString('id-ID')}
- Metode: ${this._getPaymentMethodName(payment.method)}
- Tanggal: ${new Date(payment.updatedAt).toLocaleDateString('id-ID')}

${payment.paymentType === 'downPayment' ? 
`Sisa pembayaran sebesar Rp ${order.paymentDetails.remainingPayment.amount.toLocaleString('id-ID')} dapat dilakukan pada tanggal ${order.paymentDetails.remainingPayment.dueDate ? new Date(order.paymentDetails.remainingPayment.dueDate).toLocaleDateString('id-ID') : 'yang akan kami informasikan nanti'}.` : ''}

${payment.paymentType === 'fullPayment' || payment.paymentType === 'remainingPayment' ? 
'Pesanan Anda akan segera kami proses. Kami akan menginformasikan perkembangan produksi secara berkala.' : 'Kami akan segera memproses pesanan Anda.'}

Terima kasih atas kepercayaan Anda.`;

    return this.sendMessage(customer.phone, message);
  }
  
  /**
   * Send order status update notification
   * @param {Object} order - Order object
   * @param {string} newStatus - New order status
   * @param {Object} customer - Customer object with phone number
   * @returns {Promise} - Send message result
   */
  async sendOrderStatusUpdate(order, newStatus, customer) {
    const statusMessages = {
      'Pesanan Diterima': 'Pesanan Anda telah kami terima dan akan segera diproses.',
      'Diproses': 'Pesanan Anda sedang dalam proses produksi.',
      'Selesai Produksi': 'Pesanan Anda telah selesai diproduksi.',
      'Siap Kirim': 'Pesanan Anda telah siap dan dapat diambil di toko kami.',
      'Selesai': 'Pesanan Anda telah selesai. Terima kasih telah berbelanja dengan kami.'
    };
    
    const message = `*Update Status Pesanan - ${order.orderNumber}*
    
Halo ${customer.name},

Status pesanan Anda telah diperbarui:

- No. Pesanan: ${order.orderNumber}
- Status Baru: ${newStatus}
- Tanggal Update: ${new Date().toLocaleDateString('id-ID')}

${statusMessages[newStatus] || ''}

${newStatus === 'Siap Kirim' ? `Anda dapat mengambil pesanan di alamat toko kami:
Jl. Konveksi Sejahtera No. 123, Jakarta Selatan.

Jam operasional: Senin-Sabtu, 08.00-17.00 WIB.` : ''}

Jika ada pertanyaan, silakan hubungi kami melalui WhatsApp ini.

Terima kasih atas kepercayaan Anda.`;

    return this.sendMessage(customer.phone, message);
  }
  
  /**
   * Send payment due date notification
   * @param {Object} order - Order object
   * @param {Object} customer - Customer object with phone number
   * @returns {Promise} - Send message result
   */
  async sendPaymentDueDate(order, customer) {
    if (!order.paymentDetails.remainingPayment.dueDate) {
      throw new Error('No payment due date set');
    }
    
    const dueDate = new Date(order.paymentDetails.remainingPayment.dueDate);
    const formattedDate = dueDate.toLocaleDateString('id-ID');
    
    const message = `*Pengingat Pelunasan - ${order.orderNumber}*
    
Halo ${customer.name},

Kami ingin mengingatkan jadwal pelunasan untuk pesanan Anda:

- No. Pesanan: ${order.orderNumber}
- Tanggal Pelunasan: ${formattedDate}
- Jumlah: Rp ${order.paymentDetails.remainingPayment.amount.toLocaleString('id-ID')}

Silakan lakukan pembayaran sebelum tanggal tersebut untuk memastikan pesanan Anda dapat diselesaikan tepat waktu.

Metode pembayaran tersedia:
- Transfer Bank BCA: 1234567890 (CV Konveksi Sejahtera)
- Transfer Bank BNI: 0987654321 (CV Konveksi Sejahtera)

Jika sudah melakukan pembayaran, mohon konfirmasi dengan membalas pesan ini.

Terima kasih atas kerjasamanya.`;

    return this.sendMessage(customer.phone, message);
  }
  
  /**
   * Get payment method display name
   * @param {string} methodCode - Payment method code
   * @returns {string} - Display name
   * @private
   */
  _getPaymentMethodName(methodCode) {
    const methodMap = {
      'va_bca': 'Virtual Account BCA',
      'va_bni': 'Virtual Account BNI',
      'va_mandiri': 'Virtual Account Mandiri',
      'va_bri': 'Virtual Account BRI',
      'bank_transfer': 'Transfer Bank',
      'cash': 'Tunai',
      'other': 'Metode Lainnya'
    };
    
    return methodMap[methodCode] || methodCode;
  }
}

// Export singleton instance
module.exports = new WhatsAppNotifier();