const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "view",
        "cancel",
        "upload",
        "status_change",
        "payment_confirmation",
        "refund",
        "password_reset",
        "profile_update",
        "search",
        "filter",
        "export",
        "import",
        "generate_report",
        "assign_role",
        "revoke_role",
        "approve",
        "reject",
        "verify",
        "send_notification",
        "verify_email",
        "block_user",
        "unblock_user",
        "add_to_cart",
        "remove_from_cart",
        "checkout",
        "apply_discount",
        "add_review",
        "delete_review",
        "system_maintenance",
        "data_backup",
        "data_restore",
        "api_call",
        "error_occurrence",
        "security_event",
        "configuration_change",
        "manual_override",
        "data_migration",
      ],
      required: true,
    },
    module: {
      type: String,
      enum: [
        "user",
        "product",
        "order",
        "payment",
        "cart",
        "category",
        "review",
        "discount",
        "shipping",
        "inventory",
        "report",
        "notification",
        "settings",
        "authentication",
        "role_management",
        "activity_log",
        "integration",
        "cms",
        "support_ticket",
        "design",
        "file_management",
        "auth"
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quicker searches
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ module: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);

module.exports = ActivityLog;
