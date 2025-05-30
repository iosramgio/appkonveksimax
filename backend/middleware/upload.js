const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { cloudinary } = require("../config/cloudinary");

// Create temp directories if they don't exist
const createTempDirectories = () => {
  const tempDir = path.join(__dirname, "..", "temp");
  const uploadsDir = path.join(tempDir, "uploads");

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
};

// Create directories on server start
createTempDirectories();

// Storage configuration for local temporary files
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "temp", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter functions
const imageFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const documentFilter = (req, file, cb) => {
  // Accept docs and images
  if (
    !file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx)$/i)
  ) {
    return cb(new Error("Only image and document files are allowed!"), false);
  }
  cb(null, true);
};

const backupFilter = (req, file, cb) => {
  // Accept only gzip files
  if (!file.originalname.match(/\.(gz)$/i)) {
    return cb(new Error("Only .gz backup files are allowed!"), false);
  }
  cb(null, true);
};

// For custom designs
const uploadDesign = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: documentFilter,
});

// For backup files
const uploadBackup = multer({
  storage: tempStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: backupFilter,
});

/**
 * Middleware to upload file to Cloudinary after multer
 * @param {string} folder - Cloudinary folder name
 * @param {string} fileField - Form field name for the file
 */
const uploadToCloudinary = (folder, fileField) => {
  return async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: folder,
      });

      // Add Cloudinary URL to request
      req.cloudinaryUrl = result.secure_url;
      req.cloudinaryPublicId = result.public_id;

      // Delete local file
      fs.unlinkSync(req.file.path);

      next();
    } catch (error) {
      // Delete local file in case of error
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      next(error);
    }
  };
};

/**
 * Middleware to upload multiple files to Cloudinary after multer
 * @param {string} folder - Cloudinary folder name
 * @param {string} fileField - Form field name for the files
 */
const uploadMultipleToCloudinary = (folder, fileField) => {
  return async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise(async (resolve, reject) => {
          try {
            // Upload file to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
              folder: folder,
            });

            // Delete local file
            fs.unlinkSync(file.path);

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              originalname: file.originalname,
            });
          } catch (error) {
            // Delete local file in case of error
            if (file.path) {
              fs.unlinkSync(file.path);
            }

            reject(error);
          }
        });
      });

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);

      // Add Cloudinary URLs to request
      req.cloudinaryUrls = uploadResults.map((result) => result.url);
      req.cloudinaryPublicIds = uploadResults.map((result) => result.publicId);

      next();
    } catch (error) {
      // Clean up any remaining local files
      if (req.files) {
        req.files.forEach((file) => {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      next(error);
    }
  };
};

module.exports = {
  uploadDesign,
  uploadBackup,
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
