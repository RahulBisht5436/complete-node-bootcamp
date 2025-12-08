const nodemailer = require('nodemailer');      // Email sending library
const catchAsync = require('./catchAsync');    // Async wrapper (not used here)
const pug = require('pug');
const htmlToText = require('html-to-text');

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

const emailHandler = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = process.env.MAIL_FROM;
  }
  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_PASSWORD
        }
      });
    }
  }

  send(tempalte, subject) {
    //render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${tempalte}.pugs`, {
      firstName: this.firstName,
      url: this.url,
      subject: subject
    })
    //sends the actual email
    // const mailOptions = {
    //   from: this.from, // Sender name + email
    //   to: this.to,                                     // Recipient email
    //   subject: subject,                              // Subject line
    //   html: html,                                     // HTML body
    //   text: htmlToText.fromString(html)                // Plain text body
        
    // };
    mailOptions 

    //create a transport and send email


  }
  sendWelcome() {
    //send welcome email
    this.send("welcome", "Welcome to the Natours Family!");
  }
}

const sendEmail = async (options) => {


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
    from: process.env.MAIL_FROM, // Sender name + email
    to: options.email,                                     // Recipient email
    subject: options.subject,                              // Subject line
    text: options.text,                                     // Plain text body
  };

  // --------------------------------------------------------
  // Send the email using the transporter
  // Returns a promise with email details
  // --------------------------------------------------------
  return await transporter.sendMail(mailOptions);
};


// Export sendEmail function
module.exports = { sendEmail, emailHandler };
