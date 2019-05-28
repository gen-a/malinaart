const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const flash = require('connect-flash');

const session = require('./express-session');
const config = require('./config');



const app = function(){
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
  //server.use(session());

  return server;
};

module.exports = app;