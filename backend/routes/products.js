const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");
const {
  isAdmin,
  isAdminOrCashier,
  isAdminOrStaff,
} = require("../middleware/roleCheck");
const { uploadProductImage, uploadDesignFile } = require("../config/cloudinary");
const Product = require("../models/Product");

// Public routes - accessible to all
router.get("/", productController.getAllProducts);
router.get("/categories", productController.getProductCategories);
router.get("/:id", productController.getProductById);

// Upload custom design - requires authentication
router.post(
  "/upload-design", 
  auth, 
  uploadDesignFile.single("file"), 
  productController.uploadDesign
);

// Publik endpoint untuk perhitungan harga
router.post('/calculate-price', productController.calculatePrice);

// Protected routes
router.use(auth);

// Admin only routes
router.post(
  "/",
  isAdmin,
  uploadProductImage.array("images", 5),
  productController.createProduct
);
router.put(
  "/:id",
  isAdmin,
  uploadProductImage.array("images", 5),
  productController.updateProduct
);
router.delete("/:id", isAdmin, productController.deleteProduct);

// Admin or Staff can update inventory
router.patch("/inventory", isAdminOrStaff, productController.updateInventory);

module.exports = router;
