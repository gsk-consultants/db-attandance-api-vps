const express = require("express");
const router = express.Router();
const authMiddleware = require("../middileware/authMiddleware");
const { getProfile } = require("../controllers/userController"); 
const User = require("../module/user");
// const { sendResetOTP, verifyOTPAndResetPassword } = require("../controllers/userController");
router.post("/save-token", authMiddleware(), async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: "Push token required",
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      pushToken: pushToken,
    });

    res.json({
      success: true,
      message: "Token saved successfully",
    });

  } catch (error) {
    console.log("Save token error:", error);
    res.status(500).json({ success: false });
  }
});

router.get("/profile", authMiddleware(), getProfile);

module.exports = router;
