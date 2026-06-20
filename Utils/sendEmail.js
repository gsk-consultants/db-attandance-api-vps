const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 🔥 app password
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"DBSkills Attendance" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);
  } catch (err) {
    console.log("Email Error:", err);
    
  }
};

module.exports = sendEmail;