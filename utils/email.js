const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Account Verification',
    text: `Please verify your account by clicking the link: \nhttp://${process.env.HOST}/confirmation/${token}`,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (email, username, token) => {
  const mailOptions1 = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Instructions',
    html: `<p>Dear ${username},</p>
           <p>Please click <a href="http://${process.env.HOST}/reset-password/${token}">here</a> to reset your password.</p>`
};

  return transporter.sendMail(mailOptions1);
};
