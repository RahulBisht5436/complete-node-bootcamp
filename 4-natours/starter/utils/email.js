const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = async (options) => {

    console.log("akushiagsid")

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_PASSWORD
    }
  });

  const mailOptions = {
    from: "Rahul Bisht <rahulbisht7982669162@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.text
  };

  return  await transporter.sendMail(mailOptions);
};

// const sendEmailTest = catchAsync( async function sendEmailTest(){
//     coso
// } )
module.exports = { sendEmail };
