const express = require("express");
const router = express.Router();
const materialController = require("../controllers/materialController");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleCheck");

// Public routes
router.get("/", materialController.getAllMaterials);

module.exports = router; 