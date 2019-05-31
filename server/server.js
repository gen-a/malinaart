const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

const usePassport = require('./services/passport');
const config = require('./config');
const serverRoutes = require('./routes/server/index');
const db = require('./services/db');
const PORT = config.get('server.port');


const app = function(nextHandler){
  const server = express();

  /** Middlewares */
  if (config.get('corsOrigin').length > 0) {
    server.use(cors({
      origin: [config.get('corsOrigin').split(',')],
      methods: ['POST', 'PUT'],
      credentials: true // enable set cookie
    }));
  }

  /** Turn Off X-Powered-By header */
  server.disable('x-powered-by');
  server.use(morgan('tiny'));
  server.use(flash());

  server.use(express.static(path.join(__dirname, '../build')));

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
  server.use(cookieParser());

  server.use( session({
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
  }));

  usePassport(server);

  /** Back-end */
  server.use('/api', serverRoutes);

  /** Front end */
  server.get('*', (req, res) => {
    return nextHandler(req, res);
  });

  db.connect()
    .then(() => {
      server.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Server running at http://${config.get('server.host')}:${PORT}/`);
      });
    });
  return server;
};

module.exports = app;