const express = require("express");
const router = express.Router();
const authMiddleware = require("../middileware/authMiddleware");

const {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");
const leaveModel = require("../module/leaveModel");



// 👤 USER
router.post("/request", authMiddleware(["user"]), requestLeave);
router.get("/my", authMiddleware(["user"]), getMyLeaves);


// 👨‍💼 ADMIN
router.get("/all", authMiddleware(["admin"]), getAllLeaves);
router.put("/update/:id", authMiddleware(["admin"]), updateLeaveStatus);
router.put("/mark-read", authMiddleware(["admin"]), async (req, res) => {
  try {
    await leaveModel.updateMany(
      { status: "Pending", isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});
module.exports = router;