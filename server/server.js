const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const flash = require('connect-flash');

const usePassport = require('./services/passport');
const useSession = require('./services/session');
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

  useSession(server);
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