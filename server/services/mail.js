/**
 * https://nodemailer.com/about/
 */
const nodemailer = require('nodemailer');

const config = require('../config');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: config.get('mail.host'),
  port: config.get('mail.port'),
  secure: config.get('mail.port') === 465, // true for 465, false for other ports
  auth: {
    user: config.get('mail.user'),
    pass: config.get('mail.pass'),
  }
});

// async..await is not allowed in global scope, must use a wrapper
exports.mail = (from, to, subject, text, html, attachments = []) => {
  // send mail with defined transport object
  return transporter.sendMail({ from, to, subject, text, html, attachments })
    .then((info) => {
      if (config.get('env') !== 'production') {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    });
};
