const path = require('path');

const config = require('../config');
const { mail } = require('../services/mail');
const { createHtml, htmlToText } = require('../lib/mail/generator');

const templatePath = path.resolve(__dirname, './templates/registration-letter.html');

const emailFrom = config.get('app.mailFrom');
const siteName = config.get('app.httpName');

exports.sendRegistrationLetter = (email, password) => {
  const html = createHtml(templatePath, { emailFrom, email, siteName, password });
  return mail(
    emailFrom,
    email,
    `Your registration on the site ${siteName}`,
    htmlToText(html),
    html,
    [{
      filename: 'image.png',
      path: path.resolve(__dirname, '../../static/images/logo.png'),
      cid: 'companyLogoImage'
    }]
  );
};
