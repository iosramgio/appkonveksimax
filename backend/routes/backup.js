const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const backupController = require("../controllers/backupController");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleCheck");

// Configure multer for backup file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "temp"));
  },
  filename: (req, file, cb) => {
    cb(null, `restore-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype !== "application/gzip" &&
      !file.originalname.endsWith(".gz")
    ) {
      return cb(new Error("Only gzip backup files are allowed"));
    }
    cb(null, true);
  },
});

// All routes require authentication and admin access
router.use(auth);
router.use(isAdmin);

// Backup routes
router.get("/info", backupController.getBackupInfo);
router.get("/export", backupController.backupDatabase);
router.post(
  "/restore",
  upload.single("backup"),
  backupController.restoreDatabase
);

module.exports = router;
