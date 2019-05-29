const path = require('path');

const config = require('../config');
const { mail } = require('../services/mail');
const { createHtml, htmlToText } = require('../lib/mail/generator');

const templatePath = path.resolve(__dirname, './templates/access-letter.html');

const emailFrom = config.get('app.mailFrom');
const siteName = config.get('app.httpName');

exports.sendAccessLetter = (email, visa, visaExpirationDate) => {
  const time = new Date(new Date().setTime(visaExpirationDate)).toUTCString();
  const access = `/enter-account/${visa}`;
  const html = createHtml(templatePath, { emailFrom, access, siteName, time });

  return mail(
    emailFrom,
    email,
    `Restore access to the web site ${siteName}`,
    htmlToText(html),
    html,
    [{
      filename: 'image.png',
      path: path.resolve(__dirname, '../../static/images/logo.png'),
      cid: 'companyLogoImage'
    }]
  );
};