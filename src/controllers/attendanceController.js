const Attendance = require('../module/attendanceModel');
const User = require("../module/user");

const getLocalDate = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata", // ✅ FIXED
  });

// ───────────────────────── CHECK-IN ─────────────────────────
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;

    const location =
      typeof req.body.location === "string"
        ? JSON.parse(req.body.location)
        : req.body.location;

    const photo = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    if (!photo || !location) {
      return res.status(400).json({
        success: false,
        message: "Photo and location required",
      });
    }

    const now = new Date();
    const today = getLocalDate();

    let attendance = await Attendance.findOne({
      user: userId,
      date: today,
    });

    if (attendance && attendance.checkIn?.time) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: today,
      });
    }

    attendance.checkIn = {
      time: now,
      location,
      photo,
      status: "OnTime",        // ✅ keep for frontend
      displayStatus: "Marked", // ✅ new logic
    };

    await attendance.save();

    res.json({
      success: true,
      message: "Check-in successful",
      status: "OnTime",
      displayStatus: "Marked",
    });

  } catch (error) {
    console.log("CheckIn Error:", error);
    res.status(500).json({ success: false });
  }
};

// ───────────────────────── CHECK-OUT ─────────────────────────
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;

    const location =
      typeof req.body.location === "string"
        ? JSON.parse(req.body.location)
        : req.body.location;

    const photo = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    if (!photo || !location) {
      return res.status(400).json({
        success: false,
        message: "Photo and location required",
      });
    }

    const now = new Date();
    const today = getLocalDate();

    const attendance = await Attendance.findOne({
      user: userId,
      date: today,
    });

    if (!attendance || !attendance.checkIn?.time) {
      return res.status(400).json({
        success: false,
        message: "Check-in required first",
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({
        success: false,
        message: "Already checked out",
      });
    }

    const checkInTime = new Date(attendance.checkIn.time);
    const diffMs = now - checkInTime;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    const workingHours = `${hours}h ${minutes}m`;

    attendance.checkOut = {
      time: now,
      location,
      photo,
      status: "OnTime",        // ✅ keep for frontend
      displayStatus: "Marked", // ✅ new logic
    };

    attendance.workingHours = workingHours;

    await attendance.save();

    res.json({
      success: true,
      message: "Check-out successful",
      workingHours,
      status: "OnTime",
      displayStatus: "Marked",
    });

  } catch (error) {
    console.log("CheckOut Error:", error);
    res.status(500).json({ success: false });
  }
};

// ───────────────────────── TODAY ATTENDANCE ─────────────────────────
exports.getTodayAttendance = async (req, res) => {
  try {
    const today = getLocalDate(); // ✅ FIXED

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today,
    }).populate("user", "name designation username email");

    res.json({
      success: true,
      data: attendance || null,
    });

  } catch (err) {
    console.log("Get Attendance Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

// ───────────────────────── MY ATTENDANCE ─────────────────────────
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({
      user: req.user.id,
    }).sort({ date: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ───────────────────────── ALL ATTENDANCE ─────────────────────────
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "name designation username email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: records,
    });

  } catch (err) {
    console.log("Get All Attendance Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};