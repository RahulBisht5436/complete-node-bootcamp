const nodemailer = require('nodemailer');      // Email sending library
const catchAsync = require('./catchAsync');    // Async wrapper (not used here)


// ------------------------------------------------------------
// sendEmail()
// Sends an email using Nodemailer and SMTP configuration
//
// options = {
//   email: "recipient@example.com",
//   subject: "Email Subject",
//   text: "Email body message"
// }
// ------------------------------------------------------------
const sendEmail = async (options) => {

  console.log("akushiagsid");   // Debug log

  // --------------------------------------------------------
  // Create transporter (email sending engine)
  // Uses SMTP server credentials from environment variables
  // --------------------------------------------------------
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,             // SMTP host (e.g., smtp.gmail.com)
    port: Number(process.env.EMAIL_PORT),     // SMTP port (usually 465/587)
    auth: {
      user: process.env.ADMIN_EMAIL,          // Email address used to send mail
      pass: process.env.ADMIN_PASSWORD        // Email password or app password
    }
  });

  // --------------------------------------------------------
  // Email content configuration
  // --------------------------------------------------------
  const mailOptions = {
    from: "Rahul Bisht <rahulbisht7982669162@gmail.com>", // Sender name + email
    to: options.email,                                     // Recipient email
    subject: options.subject,                              // Subject line
    text: options.text                                     // Plain text body
  };

  // --------------------------------------------------------
  // Send the email using the transporter
  // Returns a promise with email details
  // --------------------------------------------------------
  return await transporter.sendMail(mailOptions);
};


// Export sendEmail function
module.exports = { sendEmail };
