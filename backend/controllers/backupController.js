const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const archiver = require("archiver");
const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");
const { disconnectDB, connectDB } = require("../config/database");

/**
 * Backup database
 */
const backupDatabase = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const backupDir = path.join(__dirname, "..", "backups");
    const backupFilename = `konveksi-backup-${timestamp}.gz`;
    const backupPath = path.join(backupDir, backupFilename);

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Get MongoDB connection URI from environment
    const dbUri = process.env.MONGO_URI;
    const dbName = dbUri.split("/").pop().split("?")[0];

    // Create backup command
    const cmd = `mongodump --uri="${dbUri}" --archive="${backupPath}" --gzip`;

    // Execute backup command
    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        console.error("Backup error:", error);
        return res
          .status(500)
          .json({ message: "Backup failed", error: error.message });
      }

      // Log activity
      await new ActivityLog({
        user: req.user._id,
        action: "backup",
        module: "backup",
        description: "Created database backup",
        details: { filename: backupFilename },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).save();

      // Download the file
      res.download(backupPath, backupFilename, (err) => {
        if (err) {
          console.error("Download error:", err);
          return res
            .status(500)
            .json({ message: "Download failed", error: err.message });
        }

        // Delete the file after download
        setTimeout(() => {
          fs.unlink(backupPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting backup file:", unlinkErr);
            }
          });
        }, 60000); // Wait 1 minute before deleting
      });
    });
  } catch (error) {
    console.error("Backup controller error:", error);
    res.status(500).json({ message: "Backup failed", error: error.message });
  }
};

/**
 * Restore database
 */
const restoreDatabase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No backup file provided" });
    }

    const backupPath = req.file.path;

    // Get MongoDB connection URI from environment
    const dbUri = process.env.MONGO_URI;

    // Create restore command
    const cmd = `mongorestore --uri="${dbUri}" --gzip --archive="${backupPath}" --drop`;

    // Execute restore command
    exec(cmd, async (error, stdout, stderr) => {
      if (error) {
        console.error("Restore error:", error);
        return res
          .status(500)
          .json({ message: "Restore failed", error: error.message });
      }

      // Remove the uploaded file
      fs.unlink(backupPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting uploaded backup file:", unlinkErr);
        }
      });

      // Disconnect and reconnect to refresh connections
      try {
        await disconnectDB();
        await connectDB();
      } catch (dbError) {
        console.error("Database reconnection error:", dbError);
      }

      // Log activity
      await new ActivityLog({
        user: req.user._id,
        action: "restore",
        module: "backup",
        description: "Restored database from backup",
        details: { filename: req.file.originalname },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).save();

      res.json({ message: "Database restored successfully" });
    });
  } catch (error) {
    console.error("Restore controller error:", error);
    res.status(500).json({ message: "Restore failed", error: error.message });
  }
};

/**
 * Get backup info
 */
const getBackupInfo = async (req, res) => {
  try {
    // Get all collections info
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    // Get document count for each collection
    const collectionsInfo = [];

    for (const collection of collections) {
      const count = await mongoose.connection.db
        .collection(collection.name)
        .countDocuments();
      collectionsInfo.push({
        name: collection.name,
        count,
      });
    }

    // Get database stats
    const dbStats = await mongoose.connection.db.stats();

    res.json({
      message: "Backup info retrieved successfully",
      info: {
        dbName: mongoose.connection.db.databaseName,
        collections: collectionsInfo,
        stats: {
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize,
        },
      },
    });
  } catch (error) {
    console.error("Get backup info error:", error);
    res
      .status(500)
      .json({
        message: "Failed to retrieve backup info",
        error: error.message,
      });
  }
};

module.exports = {
  backupDatabase,
  restoreDatabase,
  getBackupInfo,
};
