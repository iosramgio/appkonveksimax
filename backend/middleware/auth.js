const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")?.trim();
    
    // Debug logging
    console.log('====== AUTH MIDDLEWARE DEBUG ======');
    console.log('Request path:', req.path);
    console.log('Authorization header present:', !!req.header("Authorization"));
    console.log('Token extracted:', token ? 'Yes (length: ' + token.length + ')' : 'No');

    if (!token) {
      console.log('No token provided, authentication failed');
      console.log('================================');
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully. User ID:', decoded.id);
    
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      console.log('User not found in database');
      console.log('================================');
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log('User found:', { id: user._id, role: user.role });

    // Check if token is in user's tokens array (for logout functionality)
    const isValidToken = user.tokens.some(storedToken => 
      storedToken.trim() === token
    );

    if (!isValidToken) {
      console.log('Token not found in user tokens array');
      console.log('================================');
      return res.status(401).json({ message: "Invalid token" });
    }
    
    console.log('Token is valid');
    console.log('================================');

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    console.log('================================');
    res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = auth;
