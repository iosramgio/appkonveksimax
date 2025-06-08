const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const {
  isAdmin,
  isAdminOrOwner,
  checkRole,
} = require("../middleware/roleCheck");

// All routes require authentication
router.use(auth);

// Admin only routes
router.get("/", isAdmin, userController.getAllUsers);
router.post("/create", isAdmin, userController.createUser);

// Specific routes with :id must come before the general :id route
router.patch("/:id/deactivate", isAdmin, userController.deactivateUser);
router.patch("/:id/reactivate", isAdmin, userController.reactivateUser);
router.patch("/:id/status", isAdmin, userController.updateUserStatus);
router.post("/:id/reset-password", isAdmin, userController.resetPassword);
router.get("/:id/activity-logs", isAdminOrOwner, userController.getUserActivityLogs);

// General routes with :id
router.get("/:id", isAdminOrOwner, userController.getUserById);
router.patch("/:id", isAdmin, userController.updateUser);
router.delete("/:id", isAdmin, userController.deleteUser);

module.exports = router;
