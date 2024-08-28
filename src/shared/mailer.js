const nodemailer = require('nodemailer');
const config = require('../config/index');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'digitalseative@gmail.com',
        pass: 'suijqezakkjqpaxo'
        // user: config.emailSender.email,
        // pass: config.emailSender.app_pass
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
