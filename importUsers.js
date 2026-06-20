const mongoose = require("mongoose");
const fs = require("fs");
const User = require("./src/module/user");

mongoose.connect("mongodb://192.168.1.50:27017/attendance");

const importUsers = async () => {
  try {
    const raw = JSON.parse(fs.readFileSync("./users.json"));

    // 🔥 Extract actual data
    const users = raw.find(t => t.type === "table").data;

    for (let u of users) {
      // skip duplicates
      const exists = await User.findOne({ username: u.username });
      if (exists) {
        console.log("⏭ Skipped:", u.username);
        continue;
      }

      await User.create({
        name: u.fullname,
        designation: u.designation || "Employee",
        mobile: u.contact_number || "0000000000",

        username: u.username,

        // 🔥 generate dummy email (required field)
        email: `${u.username.toLowerCase()}@dbskills.com`,

        password: u.password, // already hashed

        role: u.role === "admin" ? "admin" : "user",
      });

      console.log("✅ Imported:", u.username);
    }

    console.log("🎉 ALL USERS IMPORTED");
    process.exit();

  } catch (err) {
    console.log("❌ Error:", err);
  }
};

importUsers();