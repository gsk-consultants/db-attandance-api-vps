const express = require('express');
const router = express.Router();
const authMiddleware = require('../middileware/authMiddleware');

const { 
  createEmployee,
  getAllEmployees,
  toggleEmployeeStatus,
  sendResetOTP,
  verifyOTPAndResetPassword,
  updateEmployee
} = require('../controllers/adminController');

// 🔹 Create employee (admin only)
router.post(
  '/create-employee',
  authMiddleware(['admin']),
  createEmployee
);
router.put(
  "/update-employee/:id",
  authMiddleware(["admin"]),
  updateEmployee
);
router.put(
  "/toggle-status/:id",
  authMiddleware(["admin"]),
  toggleEmployeeStatus
);
// 🔹 Get all employees (admin only)
router.get(
  '/employees',
  authMiddleware(['admin']),
  getAllEmployees
);

module.exports = router;
