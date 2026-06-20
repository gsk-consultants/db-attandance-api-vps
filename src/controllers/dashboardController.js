const User = require("../module/user");
const Attendance = require("../module/attendanceModel");
const Leave = require("../module/leaveModel");

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 👥 Employees
    const totalEmployees = await User.countDocuments({ role: "user" });
    const activeEmployees = await User.countDocuments({
      role: "user",
      isActive: true,
    });

    // 📊 Today Attendance
    const todayAttendance = await Attendance.find({ date: today });

    const present = todayAttendance.filter(a => a.checkIn?.time).length;
    const absent = totalEmployees - present;
    const late = todayAttendance.filter(a => a.checkIn?.status === "Late").length;

    // 🏖 Leaves
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    const approvedLeaves = await Leave.countDocuments({ status: "Approved" });
    const rejectedLeaves = await Leave.countDocuments({ status: "Rejected" });

    res.json({
      success: true,
      data: {
        employees: totalEmployees,
        activeEmployees,

        today: {
          present,
          absent,
          late,
        },

        leaves: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves,
        },
      },
    });
  } catch (err) {
    console.log("Dashboard error:", err);
    res.status(500).json({ success: false });
  }
};