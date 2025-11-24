const nodemailer = require('nodemailer')



const  sendEmail = async options =>{
    const transporter = nodemailer.createTransport(
        {
            host:process.env.EMAIL_HOST ,
            port: process.env.EMAIL_PORT ,
            service:'gmail',
            auth:{
                user:process.env.ADMIN_EMAIL,
                pass:process.env.ADMIN_PASSWORD
            },

        }
    )



    const sendOptions = {
        from:"rahulbisht <rahulbisht7982669162@gmail.com>",
        to: options.email,
        subject:options.subbject,
        text:options.text
    }

    await transporter.sendMail(sendOptions)

}

module.exports ={ sendEmail}