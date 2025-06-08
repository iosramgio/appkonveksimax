const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");
const {
  isAdmin,
  isCashier,
  isStaff,
  isAdminOrCashier,
  isNotCustomer,
} = require("../middleware/roleCheck");
const { uploadDesignFile } = require("../config/cloudinary");

// All routes require authentication
router.use(auth);

// Customer routes
router.post("/", orderController.createOrder);

// Manual order route (Cashier & Admin)
router.post("/manual", isAdminOrCashier, orderController.createManualOrder);

// Get all orders (with filters)
router.get("/", orderController.getAllOrders);

// Get production orders (for staff)
router.get("/production", isStaff, orderController.getAllOrders);

// Get order by ID
router.get("/:id", orderController.getOrderById);

// Update order status routes
router.patch("/:id/status", isNotCustomer, orderController.updateOrderStatus);

// Cancel order
router.patch("/:id/cancel", orderController.cancelOrder);

// Set payment due date (Admin & Cashier)
router.patch(
  "/:id/payment-due-date",
  isAdminOrCashier,
  orderController.setPaymentDueDate
);

module.exports = router;
