const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    designation: String,
    mobile: String,
    username: String,
    email: String,
    password: String,
resetOTP: String,
otpExpiry: Date,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    pushToken: { type: String },

    // ✅ ADD THIS
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
