const path = require('path');
const fs = require('fs');
const { checkRequired } = require('../lib/env-params');

/** Check required parameters. */
const params = [
  'DB_MONGO_URL',
  'DB_MONGO_URL__TEST',
  'SESSION_SECRET_KEY',
  'MAIL_PASS',
  'MAIL_PASS__DEV',
  'MAIL_PASS__TEST',
  'JWT_PRIVATE_KEY'
];
checkRequired(params);

/** Set env parameters depending on mode. */
const suffixes = { test: '__TEST', development: '__DEV' };
if (suffixes.hasOwnProperty(process.env.NODE_ENV)) {

  const suffix = suffixes[process.env.NODE_ENV];
  const regexp = new RegExp(`${suffix}$`);

  Object.keys(process.env).forEach(k => {
    if (k.match(regexp) !== null) {
      process.env[k.substr(0, k.length - suffix.length)] = process.env[k];
    }
  });
}

/** Destructurization of process.env for using in schema. */
const {
  DB_MONGO_URL, SESSION_SECRET_KEY, MAIL_PASS, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY
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
    publicKey: {
      doc: 'JWT public key.',
      format: String,
      default: JWT_PUBLIC_KEY,
      env: 'JWT_PUBLIC_KEY',
      sensitive: true
    },
    expiresIn:{
      doc: 'JWT expiration time limit in ms format',
      format: String,
      default: '30m'
    },
    audience:{
      doc: 'JWT audience',
      format: String,
      default: 'http://malinaart.com'
    },
    issuer:{
      doc: 'JWT issuer',
      format: String,
      default: 'MalinaArt'
    },
    subject:{
      doc: 'JWT subject',
      format: String,
      default: 'user@malinaart.com'
    },
    refreshKey: {
      expiresIn:{
        doc: 'Refresh key expiration time limit in ms format',
        format: String,
        default: '30d'
      },
      userLimit:{
        doc: 'Limit of refresh tokens for user',
        format: Number,
        default: 2
      },
    }
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
