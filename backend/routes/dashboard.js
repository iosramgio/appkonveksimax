const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");
const {
  isAdmin,
  isCashier,
  isStaff,
  isOwner,
  isCustomer
} = require("../middleware/roleCheck");

// All routes require authentication
router.use(auth);

// Admin dashboard
router.get("/admin", isAdmin, dashboardController.getAdminDashboard);

// Cashier dashboard
router.get("/cashier", isCashier, dashboardController.getCashierDashboard);

// Staff dashboard
router.get("/staff", isStaff, dashboardController.getStaffDashboard);

// Owner dashboard
router.get("/owner", isOwner, dashboardController.getOwnerDashboard);

// Customer dashboard
router.get("/customer", isCustomer, dashboardController.getCustomerDashboard);

// Activity logs (admin only)
router.get("/activity-logs", isAdmin, dashboardController.getActivityLogs);
router.get("/export-logs", isAdmin, dashboardController.exportLogs);

module.exports = router; 