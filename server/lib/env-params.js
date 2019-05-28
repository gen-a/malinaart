require('colors');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 *
 .env: Default.
 .env.local: Local overrides. This file is loaded for all environments except test.
 .env.development, .env.test, .env.production: Environment-specific settings.
 .env.development.local, .env.test.local, .env.production.local: Local overrides of environment-
 *
 * */


/**
 * Override process.env parameters by the given .env file
 * @param envFile {String} - path to the .env.override file
 */
exports.override = (envFile) => {
  const envConfig = dotenv.parse(fs.readFileSync(envFile));
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
};

/**
 * Check required params in .env file
 * @param params
 */
exports.checkRequired = (params) => {
  const falied = [];
  params.forEach((name) => {
    if (!process.env[name]) {
      falied.push(name);
    }
  });
  if (falied.length) {
    console.log(`Required environment variable ${falied.join(', ')} is not set`.cyan);
    console.log('Please configure required environment variables to run the server'.bgRed);
    process.exit();
  }
};

/**
 * Break script if Node is not in test mode
 */
exports.exitIfNotTest = () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('run this script in NODE_ENV test mode only!'.red);
    process.exit();
  }
};