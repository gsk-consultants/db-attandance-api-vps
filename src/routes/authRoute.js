// src/routes/authRoute.js
const express = require('express');
const router = express.Router();
const { register, login, getDashboardData } = require('../controllers/authController');
const { sendResetOTP, verifyOTPAndResetPassword } = require('../controllers/userController');

router.post('/register', register);
router.post("/send-otp", sendResetOTP);
router.post("/verify-otp", verifyOTPAndResetPassword);
router.post('/login', login);
router.get('/dashboard', getDashboardData);

module.exports = router
 