const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    // Optional filters
    const filters = {};
    if (req.query.role) {
      filters.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query with filters and pagination
    const users = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-password -tokens'); // Exclude sensitive data

    // Get total count for pagination
    const total = await User.countDocuments(filters);

    res.json({
      message: "Users retrieved successfully",
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: error.message });
  }
};

/**
 * Create new user (Admin only)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, address, isActive } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: "Nama, email, password, dan role harus diisi" 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role,
      address,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id
    });

    await user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "create",
      module: "user",
      description: `Created new user: ${email}`,
      details: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.status(201).json({
      message: "User berhasil ditambahkan",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Create user error:", error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan user", error: error.message });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -tokens');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User retrieved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve user", error: error.message });
  }
};

/**
 * Update user (Admin only)
 */
const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Define allowed updates based on role
    const allowedUpdates = [
      "name",
      "email",
      "phone",
      "address",
      "role",
      "isActive",
      "password"
    ];

    // Check for email uniqueness if email is being updated
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }
    }

    // Filter out updates that are not allowed
    const validUpdates = Object.keys(updates).filter((update) =>
      allowedUpdates.includes(update)
    );

    if (validUpdates.length === 0) {
      return res.status(400).json({ message: "No valid updates" });
    }

    // Apply updates
    validUpdates.forEach((update) => {
      if (update === 'password' && updates[update]) {
        user.password = updates[update]; // The password will be hashed by the pre-save middleware
      } else if (update !== 'password') {
        user[update] = updates[update];
      }
    });

    await user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "update",
      module: "user",
      description: `Updated user: ${user.email}`,
      details: { userId: user._id, updates: validUpdates },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: "Failed to update user", 
      error: error.message 
    });
  }
};

/**
 * Reset user password (Admin only)
 */
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "update",
      module: "user",
      description: `Reset password for user: ${user.email}`,
      details: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ message: "Failed to reset password", error: error.message });
  }
};

/**
 * Deactivate user (soft delete)
 */
const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Make sure admin doesn't deactivate themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot deactivate your own account" });
    }

    // Set active to false
    user.isActive = false;
    await user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "deactivate",
      module: "user",
      description: `Deactivated user: ${user.email}`,
      details: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Deactivate user error:", error);
    res
      .status(500)
      .json({ message: "Failed to deactivate user", error: error.message });
  }
};

/**
 * Reactivate user (Admin only)
 */
const reactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reactivate user
    user.isActive = true;
    await user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "reactivate",
      module: "user",
      description: `Reactivated user: ${user.email}`,
      details: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({ message: "User reactivated successfully" });
  } catch (error) {
    console.error("Reactivate user error:", error);
    res
      .status(500)
      .json({ message: "Failed to reactivate user", error: error.message });
  }
};

/**
 * Update user status (Active/Inactive)
 */
const updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ message: "isActive field is required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Make sure admin doesn't deactivate themselves
    if (!isActive && user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot deactivate your own account" });
    }

    // Update status
    user.isActive = Boolean(isActive);
    await user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: isActive ? "reactivate" : "deactivate",
      module: "user",
      description: `${isActive ? "Activated" : "Deactivated"} user: ${user.email}`,
      details: { userId: user._id, isActive },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({ 
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res
      .status(500)
      .json({ message: "Failed to update user status", error: error.message });
  }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Make sure admin doesn't delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "delete",
      module: "user",
      description: `Deleted user: ${user.email}`,
      details: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};

/**
 * Get user activity logs
 */
const getUserActivityLogs = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get activity logs for the user
    const logs = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email');

    res.json({
      message: "User activity logs retrieved successfully",
      logs
    });
  } catch (error) {
    console.error("Get user activity logs error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve user activity logs", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  resetPassword,
  deactivateUser,
  reactivateUser,
  updateUserStatus,
  deleteUser,
  getUserActivityLogs
};
