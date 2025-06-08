const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is required only if googleId is not provided
        return !this.googleId;
      },
      minlength: 6,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "cashier", "staff", "owner", "customer"],
      default: "customer",
    },
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    tokens: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hide sensitive data when user object is sent to client
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password") && user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Generate JWT token
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });

  // Batasi jumlah token maksimal 2
  // Jika tokens sudah lebih dari 2, hapus token paling lama
  if (user.tokens.length >= 2) {
    // Buang token paling awal (paling lama)
    user.tokens = user.tokens.slice(-1);
  }
  
  // Ensure token is trimmed before storing
  user.tokens.push(token.trim());
  await user.save();

  return token;
};

// Clean expired tokens
UserSchema.methods.cleanExpiredTokens = async function () {
  const user = this;
  const validTokens = [];
  
  // Check each token for validity
  for (const token of user.tokens) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      validTokens.push(token);
    } catch (error) {
      // Token is expired or invalid, don't add to validTokens
    }
  }
  
  // Update tokens array with only valid tokens
  user.tokens = validTokens;
  await user.save();
  
  return validTokens;
};

// Find user by credentials
UserSchema.statics.findByCredentials = async (email, password) => {
  console.log("Login attempt email:", email);
  const user = await User.findOne({ email: email.toLowerCase() });
  console.log("User found:", user);
  
  if (!user) {
    console.log("User not found");
    throw new Error("Invalid credentials");
  }

  if (!user.isActive) {
    console.log("User is inactive");
    throw new Error("Account is deactivated. Please contact administrator.");
  }

  // If user has googleId and no password, they should use Google to login
  if (user.googleId && !user.password) {
    throw new Error("Please login with Google");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Password match:", isMatch);
  if (!isMatch) {
    console.log("Password does not match");
    throw new Error("Invalid credentials");
  }
  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
