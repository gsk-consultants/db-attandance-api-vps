
const User = require('../module/user');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      success: true,
      data: user
    });

  } catch (err) {
    console.log("Profile error:", err);
    res.status(500).json({ success: false });
  }
};


exports.sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body; // employee email

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ SEND TO ADMIN (NOT EMPLOYEE)
    await transporter.sendMail({
      to: process.env.EMAIL, // 🔥 ADMIN EMAIL
      subject: "Admin OTP for Password Reset",
      text: `
Admin OTP for resetting password of ${user.name}

Employee Email: ${user.email}
OTP: ${otp}

Valid for 5 minutes.
      `,
    });

    res.json({
      success: true,
      message: "OTP sent to admin email",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = null;
    user.otpExpiry = null;

    await user.save();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ MAIL TO EMPLOYEE
await transporter.sendMail({
  to: email,
  subject: "Your Login Details Updated",
  text: `
Hello ${user.name},

Your password has been reset by admin.

 Username: ${user.username}
 Password: ${newPassword}

Please Login on  App.

Regards,
Admin
  `,
});

// ✅ MAIL TO ADMIN
await transporter.sendMail({
  to: process.env.EMAIL,
  subject: "Employee Password Reset Successful",
  text: `
Password reset completed successfully.

Employee Name: ${user.name}
Employee Email: ${user.email}

 Username: ${user.username}
 New Password: ${newPassword}`,
});
    res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};