const nodemailer = require("nodemailer");

const mailHelper = async (option) => {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        auth: {
            user: process.env.SMPT_USER, // generated ethereal user
            pass: process.env.SMPT_PASS, // generated ethereal password
        },
    });
    const message = {
        from: 'technorizenanurag@gmail.com', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
    }
    // send mail with defined transport object
    await transporter.sendMail(message);
}
module.exports = mailHelper;