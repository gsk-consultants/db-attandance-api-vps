const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ADD THIS (IMPORTANT)
app.use("/uploads", express.static("uploads"));

/* =========================
   DATABASE CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

/* =========================
   ROUTES
========================= */

app.use("/api/auth", require("./src/routes/authRoute"));
app.use("/api/user", require("./src/routes/userRoute"));
app.use("/api/attendance", require("./src/routes/attendanceRoute"));
app.use("/api/admin", require("./src/routes/adminRoute"));

const leaveRoutes = require("./src/routes/leaveRoutes");
app.use("/api/leave", leaveRoutes);
app.use("/api/dashboard", require("./src/routes/dashboard"));
/* =========================
   DEFAULT ROUTE
========================= */

app.get("/", (req, res) => {
  res.send("🚀 Attendance API Running");
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.log("Global Error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Image too large. Max size is 5MB",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 6002;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);