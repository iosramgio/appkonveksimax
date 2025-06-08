const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleCheck");
const passport = require("../config/passport");

// Register routes
router.post("/register", authController.register); // Public route for customer registration
router.post("/register/staff", auth, isAdmin, authController.register); // Admin only route for staff registration

// Login route
router.post("/login", authController.login);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.googleCallback
);
router.post("/google/verify", authController.verifyGoogleToken);

// Protected routes (require authentication)
router.post("/logout", auth, authController.logout);
router.get("/profile", auth, authController.getProfile);
router.patch("/profile", auth, authController.updateProfile);
router.post("/change-password", auth, authController.changePassword);

module.exports = router;
