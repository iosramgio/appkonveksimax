const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Verifikasi bahwa environment variables sudah diatur
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('CLOUDINARY CONFIG ERROR: Missing required environment variables');
  console.log('Available env:', {
    CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    API_KEY: Boolean(process.env.CLOUDINARY_API_KEY),
    API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET)
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup storage engine for Cloudinary
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'konveksi/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg'],
    transformation: [{ width: 1000, crop: 'limit' }]
  }
});

const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'konveksi/designs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'pdf'],
    resource_type: 'auto', // Tambahkan ini untuk menangani berbagai jenis file
    transformation: [{ width: 1000, crop: 'limit' }]
  }
});

// Konfigurasi multer dengan batas ukuran file yang wajar
const uploadLimits = {
  fileSize: 10 * 1024 * 1024, // batas 10MB
};

// Create multer instances
const uploadProductImage = multer({ 
  storage: productStorage,
  limits: uploadLimits 
});

const uploadDesignFile = multer({ 
  storage: designStorage,
  limits: uploadLimits
});

module.exports = {
  cloudinary,
  uploadProductImage,
  uploadDesignFile
};