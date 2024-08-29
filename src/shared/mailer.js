const nodemailer = require('nodemailer');
const config = require('../config/index');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: config.emailSender.email,
        pass: config.emailSender.app_pass
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendMail = async (to, subject, body) => {
    const mailOptions = {
        from: '"Telehealth" <sakibxrz21@gmail.com>',
        to,
        subject,
        html: body
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
