const User = require("../module/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      designation,
      mobile,
      username,
      password,
      email,
    } = req.body;

    // Check existing user
    const existing = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = new User({
      name,
      designation,
      mobile,
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    await employee.save();

    // 📧 Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your Attendance App Login",
      text: `
Hello ${name},

Your account has been created.

Name: ${name}
Designation: ${designation}

Username: ${username}
Password: ${password}

Please login in the Attendance App.

Regards,
Admin
      `,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully & email sent",
    });
  } catch (err) {
    console.error("Create Employee Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create employee",
    });
  }
};

// 🔥 Toggle Active / Inactive
exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.json({
      success: true,
      message: `Employee ${user.isActive ? "Activated" : "Deactivated"}`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedData = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      data: user,
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false });
  }
};
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "user" })
      .select("-password"); // hide password

    res.status(200).json({
      success: true,
      data: employees,
    });

  } catch (error) {
    console.error("Fetch employee error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};
