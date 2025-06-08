const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

/**
 * Register a new user (admin only can create staff, owner, cashier users)
 * Anyone can register as customer
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // If registering as non-customer, check if admin
    if (role && role !== "customer") {
      // This would be handled by middleware, but double-checking
      if (!req.user || req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admin can create staff accounts" });
      }
    }

    const userData = {
      name,
      email,
      password,
      phone,
      address,
    };

    // Set role if provided and user is admin
    if (role && req.user && req.user.role === "admin") {
      userData.role = role;
      userData.createdBy = req.user._id;
    } else {
      userData.role = "customer"; // Default role
    }

    const user = new User(userData);
    await user.save();

    // Generate token for the new user
    const token = await user.generateAuthToken();

    // Log activity
    if (req.user) {
      await new ActivityLog({
        user: req.user._id,
        action: "create",
        module: "user",
        description: `Created new ${userData.role} account: ${email}`,
        details: { userId: user._id },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).save();
    }

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

/**
 * User login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByCredentials(email, password);
    
    // Clean expired tokens before generating new token
    await user.cleanExpiredTokens();
    
    const token = await user.generateAuthToken();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await new ActivityLog({
      user: user._id,
      action: "login",
      module: "auth",
      description: "User logged in",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: "Login failed", error: error.message });
  }
};

/**
 * Google authentication callback
 */
const googleCallback = async (req, res) => {
  try {
    // Passport will have set req.user
    const user = req.user;
    const token = await user.generateAuthToken();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await new ActivityLog({
      user: user._id,
      action: "login",
      module: "auth",
      description: "User logged in with Google",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
  } catch (error) {
    console.error("Google auth error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
  }
};

/**
 * Verify Google token from frontend
 */
const verifyGoogleToken = async (req, res) => {
  try {
    const { token, googleId, email, name, imageUrl } = req.body;
    
    // Find user by Google ID or email
    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (!user.profileImage && imageUrl) {
          user.profileImage = imageUrl;
        }
      } else {
        // Create new user
        user = new User({
          googleId,
          name,
          email,
          profileImage: imageUrl,
          role: 'customer'
        });
      }
      
      await user.save();
    }
    
    // Clean expired tokens before generating new token
    await user.cleanExpiredTokens();
    
    // Generate JWT token
    const authToken = await user.generateAuthToken();
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Log activity
    await new ActivityLog({
      user: user._id,
      action: "login",
      module: "auth",
      description: "User logged in with Google",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();
    
    res.json({
      message: "Google authentication successful",
      user,
      token: authToken,
    });
  } catch (error) {
    console.error("Google token verification error:", error);
    res.status(401).json({ message: "Authentication failed", error: error.message });
  }
};

/**
 * User logout
 */
const logout = async (req, res) => {
  try {
    // Remove current token from user's tokens array
    req.user.tokens = req.user.tokens.filter((token) => token !== req.token);
    await req.user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "logout",
      module: "auth",
      description: "User logged out",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

/**
 * Get current user's profile
 */
const getProfile = async (req, res) => {
  try {
    res.json({
      message: "Profile retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve profile", error: error.message });
  }
};

/**
 * Update user's profile
 */
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ["name", "phone", "address"];

    // Filter out updates that are not allowed
    const validUpdates = Object.keys(updates).filter((update) =>
      allowedUpdates.includes(update)
    );

    if (validUpdates.length === 0) {
      return res.status(400).json({ message: "No valid updates" });
    }

    // Apply updates
    validUpdates.forEach((update) => {
      req.user[update] = updates[update];
    });

    await req.user.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "update",
      module: "user",
      description: "Updated user profile",
      details: { updates: validUpdates },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({
      message: "Profile updated successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
};

/**
 * Change user's password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const user = await User.findByCredentials(req.user.email, currentPassword);

    // Set new password
    user.password = newPassword;
    await user.save();

    // Log activity
    await new ActivityLog({
      user: user._id,
      action: "update",
      module: "auth",
      description: "Changed password",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(400)
      .json({ message: "Failed to change password", error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  googleCallback,
  verifyGoogleToken
};
