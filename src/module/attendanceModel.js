const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  checkIn: {
    time: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
    photo: String,
    status: String,        // keep for frontend (OnTime)
    displayStatus: String, // NEW (Marked)
  },

  checkOut: {
    time: String,
    location: {
      latitude: Number,
      longitude: Number,
    },
    photo: String,
    status: String,        // keep for frontend
    displayStatus: String, // NEW
  },

  workingHours: String,
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);