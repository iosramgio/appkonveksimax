const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const auth = require("../middleware/auth");
const { isAdminOrOwner, isOwner } = require("../middleware/roleCheck");

// All routes require authentication
router.use(auth);

// Admin or Owner can view reports
router.get("/sales", isAdminOrOwner, reportController.generateSalesReport);
router.get(
  "/financial",
  isAdminOrOwner,
  reportController.generateFinancialReport
);
router.get(
  "/inventory",
  isAdminOrOwner,
  reportController.generateInventoryReport
);
router.get(
  "/product-performance",
  isAdminOrOwner,
  reportController.generateProductPerformanceReport
);

module.exports = router;
