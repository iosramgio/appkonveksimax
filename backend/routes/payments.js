const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");
const { isAdminOrCashier } = require("../middleware/roleCheck");

// Public route for Midtrans notifications
router.post("/notification", paymentController.handleMidtransNotification);
router.get("/config", paymentController.getMidtransConfig);

// Routes that require authentication
router.use(auth);

// Create Snap token
router.post("/snap", paymentController.createSnapToken);

// Create payment for existing order
router.post("/pay-order", paymentController.createPaymentForExistingOrder);

// Confirm payment
router.post("/confirm", paymentController.confirmPayment);

// Routes for admin/cashier only
router.use(isAdminOrCashier);

// Get all payments
router.get("/", paymentController.getAllPayments);

// Get payment by ID
router.get("/:id", paymentController.getPaymentById);

// Verify payment
router.post("/verify/:paymentId", paymentController.verifyPayment);

// Add manual payment endpoint
router.post("/manual", paymentController.createManualPayment);

module.exports = router;
