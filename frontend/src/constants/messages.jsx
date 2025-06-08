// Success messages
export const SUCCESS_LOGIN = 'Login berhasil';
export const SUCCESS_LOGOUT = 'Logout berhasil';
export const SUCCESS_REGISTER = 'Registrasi berhasil';
export const SUCCESS_RESET_PASSWORD = 'Password berhasil direset';
export const SUCCESS_FORGOT_PASSWORD = 'Tautan reset password telah dikirim ke email Anda';
export const SUCCESS_PROFILE_UPDATE = 'Profil berhasil diperbarui';
export const SUCCESS_PASSWORD_UPDATE = 'Password berhasil diubah';

export const SUCCESS_CREATE_USER = 'User berhasil dibuat';
export const SUCCESS_UPDATE_USER = 'User berhasil diperbarui';
export const SUCCESS_DELETE_USER = 'User berhasil dihapus';

export const SUCCESS_CREATE_PRODUCT = 'Produk berhasil ditambahkan';
export const SUCCESS_UPDATE_PRODUCT = 'Produk berhasil diperbarui';
export const SUCCESS_DELETE_PRODUCT = 'Produk berhasil dihapus';

export const SUCCESS_CREATE_ORDER = 'Pesanan berhasil dibuat';
export const SUCCESS_UPDATE_ORDER = 'Pesanan berhasil diperbarui';
export const SUCCESS_ORDER_STATUS = 'Status pesanan berhasil diubah';

export const SUCCESS_PAYMENT = 'Pembayaran berhasil';
export const SUCCESS_PAYMENT_VERIFY = 'Pembayaran berhasil diverifikasi';

export const SUCCESS_BACKUP = 'Backup berhasil dibuat';
export const SUCCESS_RESTORE = 'Restore database berhasil';

export const SUCCESS_ADD_TO_CART = 'Produk berhasil ditambahkan ke keranjang';
export const SUCCESS_UPDATE_CART = 'Keranjang berhasil diperbarui';
export const SUCCESS_CLEAR_CART = 'Keranjang berhasil dikosongkan';

// Error messages
export const ERROR_LOGIN = 'Email atau password salah';
export const ERROR_SERVER = 'Terjadi kesalahan pada server';
export const ERROR_NETWORK = 'Koneksi gagal, silakan coba lagi';
export const ERROR_UNAUTHORIZED = 'Anda tidak memiliki akses untuk melakukan tindakan ini';
export const ERROR_NOT_FOUND = 'Data tidak ditemukan';
export const ERROR_VALIDATION = 'Data yang dimasukkan tidak valid';
export const ERROR_DUPLICATE = 'Data sudah ada dalam sistem';

export const ERROR_UPLOAD = 'Gagal mengunggah file';
export const ERROR_FILE_SIZE = 'Ukuran file terlalu besar';
export const ERROR_FILE_TYPE = 'Tipe file tidak didukung';

export const ERROR_PAYMENT = 'Pembayaran gagal diproses';
export const ERROR_CHECKOUT = 'Gagal memproses checkout';

export const ERROR_BACKUP = 'Gagal membuat backup';
export const ERROR_RESTORE = 'Gagal melakukan restore database';

export default {
  SUCCESS_LOGIN,
  SUCCESS_LOGOUT,
  SUCCESS_REGISTER,
  SUCCESS_RESET_PASSWORD,
  SUCCESS_FORGOT_PASSWORD,
  SUCCESS_PROFILE_UPDATE,
  SUCCESS_PASSWORD_UPDATE,
  SUCCESS_CREATE_USER,
  SUCCESS_UPDATE_USER,
  SUCCESS_DELETE_USER,
  SUCCESS_CREATE_PRODUCT,
  SUCCESS_UPDATE_PRODUCT,
  SUCCESS_DELETE_PRODUCT,
  SUCCESS_CREATE_ORDER,
  SUCCESS_UPDATE_ORDER,
  SUCCESS_ORDER_STATUS,
  SUCCESS_PAYMENT,
  SUCCESS_PAYMENT_VERIFY,
  SUCCESS_BACKUP,
  SUCCESS_RESTORE,
  SUCCESS_ADD_TO_CART,
  SUCCESS_UPDATE_CART,
  SUCCESS_CLEAR_CART,
  ERROR_LOGIN,
  ERROR_SERVER,
  ERROR_NETWORK,
  ERROR_UNAUTHORIZED,
  ERROR_NOT_FOUND,
  ERROR_VALIDATION,
  ERROR_DUPLICATE,
  ERROR_UPLOAD,
  ERROR_FILE_SIZE,
  ERROR_FILE_TYPE,
  ERROR_PAYMENT,
  ERROR_CHECKOUT,
  ERROR_BACKUP,
  ERROR_RESTORE
};