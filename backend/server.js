require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/database");
const passport = require("./config/passport");

// ==================================================================
// IMPORTANT: Price Calculation Strategy
// ==================================================================
// All price calculations should be performed using backend functions in utils/priceCalculator.js
// Frontend should either:
// 1. Call the /products/calculate-price API endpoint (preferred)
// 2. Use the frontend/src/utils/pricingCalculator.js functions which are synced with the backend logic
// Do NOT implement alternative calculation methods to maintain consistency
// ==================================================================

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/Order");
const paymentRoutes = require("./routes/payments");
const reportRoutes = require("./routes/reports");
const backupRoutes = require("./routes/backup");
const dashboardRoutes = require("./routes/dashboard");
const customerRoutes = require("./routes/customer");
const colorRoutes = require("./routes/colors");
const materialRoutes = require("./routes/materials");
const uploadRoutes = require("./routes/upload");

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't crash the server, just log the error
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan("dev"));

// Initialize Passport
app.use(passport.initialize());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Activity logger middleware (for all routes)
const { logActivity } = require("./middleware/logger");
app.use(logActivity);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/files", uploadRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Konveksi API is running");
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });
  
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err.message : "Server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
