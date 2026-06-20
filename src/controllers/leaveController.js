const Leave = require("../module/leaveModel");
const User = require("../module/user");
const sendNotification = require("../../Utils/notification"); // ✅ helper
const sendEmail = require("../../Utils/sendEmail");
/* =========================
   📌 USER: REQUEST LEAVE
========================= */
exports.requestLeave = async (req, res) => {
  try {
    const { fromDate, toDate, reason } = req.body;
    const userId = req.user.id;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    const diffTime = Math.abs(end - start);
    const totalDays =
      Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      user: userId,
      fromDate,
      toDate,
      totalDays,
      reason,
      isRead: false,
      status: "Pending",
    });

    // 🔍 get user details
    const user = await User.findById(userId);

    // 🔔 NOTIFY ADMIN (PUSH + EMAIL)
    const admin = await User.findOne({ role: "admin" });

    if (admin) {
      // PUSH
      if (admin.pushToken) {
        await sendNotification(
          admin.pushToken,
          "New Leave Request",
          `${user.name} requested leave`
        );
      }

      // EMAIL
      if (admin.email) {
        await sendEmail(
          admin.email,
          "New Leave Request",
          `Employee: ${user.name}
From: ${fromDate}
To: ${toDate}
Reason: ${reason}`
        );
      }
    }

    res.json({
      success: true,
      message: "Leave request submitted successfully",
      data: leave,
    });

  } catch (error) {
    console.log("Leave Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* =========================
   📌 USER: GET MY LEAVES
========================= */
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves,
    });

  } catch (err) {
    console.log("Get My Leaves Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves",
    });
  }
};


/* =========================
   📌 ADMIN: GET ALL LEAVES
========================= */
exports.getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};

    // 🔥 only unread notifications
    if (status === "Pending") {
      filter = {
        status: "Pending",
        isRead: false,
      };
    }

    const leaves = await Leave.find(filter)
      .populate("user", "name designation email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves,
    });

  } catch (err) {
    console.log("Get All Leaves Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves",
    });
  }
};

/* =========================
   📌 ADMIN: UPDATE STATUS
========================= */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminRemark } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    leave.status = status;
    leave.adminRemark = adminRemark || "";

    await leave.save();

    // 🔍 get user details
    const user = await User.findById(leave.user);

    // 🔔 NOTIFY USER (PUSH + EMAIL)
    if (user) {
      // PUSH
      if (user.pushToken) {
        await sendNotification(
          user.pushToken,
          "Leave Update",
          `Your leave has been ${status}`
        );
      }

      // EMAIL
      if (user.email) {
        await sendEmail(
          user.email,
          "Leave Status Update",
          `Hello ${user.name},

Your leave request has been ${status}.

From: ${leave.fromDate}
To: ${leave.toDate}
Remark: ${adminRemark || "No remarks"}

Regards,
DBSkills Team`
        );
      }
    }

    res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave,
    });

  } catch (err) {
    console.log("Update Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update leave",
    });
  }
};