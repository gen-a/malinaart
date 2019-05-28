const path = require('path');
const fs = require('fs');
const { checkRequired } = require('../lib/env-params');

/** Check required parameters. */
const params = ['DB_MONGO_URL', 'DB_MONGO_URL_TEST', 'SESSION_SECRET_KEY', 'MAIL_PASS', 'JWT_PRIVATE_KEY'];
checkRequired(params);

/** Set env parameters depending on mode. */
if (process.env.NODE_ENV === 'test') {
  process.env.DB_MONGO_URL = process.env.DB_MONGO_URL_TEST;
}

/** Destructurization of process.env for using in schema. */
const {
  DB_MONGO_URL, SESSION_SECRET_KEY, MAIL_PASS, JWT_PRIVATE_KEY
} = process.env;

/** Export schema. */
module.exports = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
    arg: 'env'
  },
  server: {
    host: {
      doc: 'Host address of the server.',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'HOST',
    },
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 3000,
      env: 'PORT',
      arg: 'p'
    }
  },
  corsOrigin: {
    doc: 'CORS origin comma separated addresses.',
    format: String,
    default: 'http://127.0.0.1:3001',
    env: 'CORS_ORIGIN'
  },
  session: {
    secretKey: {
      doc: 'Session secret key.',
      format: String,
      default: SESSION_SECRET_KEY,
      env: 'SESSION_SECRET_KEY',
      sensitive: true
    },
  },
  db: {
    mongo: {
      url: {
        doc: 'MongoDB url connect address.',
        format: String,
        default: DB_MONGO_URL,
        env: 'DB_MONGO_URL',
      },
    }
  },
  mail: {
    host: {
      doc: 'Mail SMTP host name.',
      format: '*',
      default: 'smtp.gmail.com',
      env: 'MAIL_HOST'
    },
    port: {
      doc: 'Mail port number.',
      format: 'port',
      default: 587,
      env: 'MAIL_PORT'
    },
    user: {
      doc: 'Mail user.',
      format: 'email',
      default: 'update.48ukraine.com@gmail.com',
      env: 'MAIL_USER'
    },
    pass: {
      doc: 'Mail password.',
      format: String,
      default: MAIL_PASS,
      env: 'MAIL_PASS',
      sensitive: true
    },
  },
  jwt: {
    privateKey: {
      doc: 'JWT private key.',
      format: String,
      default: JWT_PRIVATE_KEY,
      env: 'JWT_PRIVATE_KEY',
      sensitive: true
    },
    publicKeyFile: {
      doc: 'JWT public key file.',
      format: value => fs.existsSync(path.resolve(__dirname, '../', value)),
      default: 'lib/jwt/public.key'
    },
  },
  app: {
    dataUrl: {
      doc: 'Data url for fetching real data. ',
      format: 'url',
      default: 'https://48ukraine.com',
      env: 'DATA_SERVER_URL'
    },
    httpName: {
      doc: 'HTTP server name for the current site. ',
      format: 'url',
      default: 'https://js1-48ukraine.herokuapp.com',
      env: 'HTTP_NAME'
    },
    mailFrom: {
      doc: 'Mail from for auto messaging.',
      format: 'email',
      default: 'update.48ukraine.com@gmail.com',
      env: 'MAIL_FROM'
    },
  },
};
