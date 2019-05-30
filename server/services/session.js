const session = require('express-session');
const config = require('../config');
const FileStore = require('session-file-store')(session);
const path = require('path');

module.exports = (app) => {
  app.use(
    session({
      store: new FileStore({
        /**  Path for session files. */
        path: path.resolve(__dirname, '../sessions/'),
        /**  The number of retries to get session data from a session file. Defaults to  5 */
        retries: 5,
        /**  if secret string is specified then enables encryption/decryption. */
        secret: config.get('session.secretKey')
      }),
      /** A string which will be used as single key if keys is not provided. */
      secret: config.get('session.secretKey'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        /** a boolean indicating whether the cookie is only to be sent over HTTPS  */
        secure: false,
        /** cookie is only to be sent over HTTP(S), and not made available to client JavaScript  */
        httpOnly: true
      }
    })
  );
};