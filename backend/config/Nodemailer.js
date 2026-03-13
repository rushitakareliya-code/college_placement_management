// import nodemailer from "nodemailer";
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `"CPMS" ${process.env.SMTP_USER}`,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.log("Error sending email: ", error);
  }
};

module.exports = sendMail;