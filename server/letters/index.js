const path = require('path');

const config = require('../config');
const { mail } = require('../services/mail');
const { createHtml, htmlToText } = require('../lib/mail/generator');

const emailFrom = config.get('app.mailFrom');
const siteName = config.get('app.httpName');


const embeddedFiles = [{
  filename: 'image.png',
  path: path.resolve(__dirname, '../../static/images/logo.png'),
  cid: 'companyLogoImage'
}];


exports.mailOnRestore = (email, token, expiresAt) => {

  const time = new Date(new Date().setTime(expiresAt)).toUTCString();
  const access = `/enter-account/${token}`;
  const html = createHtml(
    path.resolve(__dirname, './templates/restore-letter.html'),
    { emailFrom, access, siteName, time }
  );

  return mail(
    emailFrom,
    email,
    `Restore access to the web site ${siteName}`,
    htmlToText(html),
    html,
    embeddedFiles
  );
};


/**
 * Send new letter with password for newly created account
 * @param email {String}
 * @param password {String}
 * @returns {Promise}
 */
exports.mailOnRegistration = (email, password) => {
  /** Create html body of the letter */
  const html = createHtml(
    path.resolve(__dirname, './templates/registration-letter.html'),
    { emailFrom, email, siteName, password }
  );

  return mail(
    emailFrom,
    email,
    `Your registration on the site ${siteName}`,
    htmlToText(html),
    html,
    embeddedFiles
  );
};

/**
 * Send new letter with password for newly created account
 * @param email {String}
 * @param password {String}
 * @returns {Promise}
 */
exports.mailOnRestorePassword = (email, password) => {
  /** Create html body of the letter */
  const html = createHtml(
    path.resolve(__dirname, './templates/restore-password-letter.html'),
    { emailFrom, email, siteName, password }
  );

  return mail(
    emailFrom,
    email,
    `Your registration on the site ${siteName}`,
    htmlToText(html),
    html,
    embeddedFiles
  );
};