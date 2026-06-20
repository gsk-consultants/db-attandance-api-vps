const express = require("express");
const router = express.Router();
const authMiddleware = require("../middileware/authMiddleware");

const { getDashboard } = require("../controllers/dashboardController");

// ADMIN ONLY
router.get("/", authMiddleware(["admin"]), getDashboard);

module.exports = router;