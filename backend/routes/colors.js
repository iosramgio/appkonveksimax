const express = require("express");
const router = express.Router();
const colorController = require("../controllers/colorController");

// Public routes
router.get("/", colorController.getAllColors);

module.exports = router; 