const nodemailer = require('nodemailer');      // Email sending library
const catchAsync = require('./catchAsync');    // Async wrapper (not used here)
const pug = require('pug');
const htmlToText = require('html-to-text');

// ------------------------------------------------------------
// Creating an Email class and storing it into a constant called emailHandler
const emailHandler = class Email {

  // This runs automatically whenever an object of Email class is created
  constructor(user, url) {
    this.to = user.email;                     // Receiver's email address (from user data)
    this.firstName = user.name.split(" ")[0]; // Extract only the first name (if full name has space)
    this.url = url;                           // URL used inside email (e.g. password reset link)

    // "from" email address (Sender)
    // Value comes from environment variable in .env file → process.env.MAIL_FROM
    // Example in .env: MAIL_FROM="Natours <no-reply@natours.com>"
    this.from = process.env.MAIL_FROM;
  }

  // Method to create a nodemailer transport (SMTP server connection)
  newCreateTransport() {

    // If the app is running in PRODUCTION environment
    if (process.env.NODE_ENV === 'production') {
      // TODO: Should return real production email service like SendGrid/Gmail
      return 1; 
    } else {
      // In development mode → use SMTP credentials from .env file (e.g. Mailtrap)
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,         // SMTP Host (e.g. smtp.mailtrap.io)
        port: Number(process.env.EMAIL_PORT), // SMTP Port (usually number)
        auth: {
          user: process.env.ADMIN_EMAIL,      // SMTP username
          pass: process.env.ADMIN_PASSWORD    // SMTP password
        }
      });
    }
  }

  // Function to send an email using a specific template and subject
  async send(template, subject) {

    // 1️⃣ Render HTML for the email using a Pug template file
    // template.pug file must exist inside /views/email/
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pugs`, {
      firstName: this.firstName, // Provide data to Pug template
      url: this.url,
      subject: subject
    })

    // 2️⃣ Email properties (who sends, who receives, HTML & text version)
    const mailOptions = {
      from: this.from,            // Sender email defined above
      to: this.to,                // Receiver (user's email)
      subject: subject,           // Email subject line
      url: this.url,              // Provided URL (used inside HTML)
      html,                       // HTML version of the email body
      text: htmlToText.fromString(html) // Plain text fallback for email clients
    }

    // 3️⃣ Create the transporter & send the mail
    // const transporter = this.createTransport();
    // transporter.sendMail(mailOptions);
    await this.newCreateTransport().sendMail(mailOptions)
  }

  // Helper function to send a ready-made "Welcome" email
  async sendWelcome() {
    // Simply calls send() with "welcome" template and a title
    await this.send("welcome", "Welcome to the Natours Family!");
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
