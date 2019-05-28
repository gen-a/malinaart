const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const convict = require('convict');

const schema = require('./config/schema');
const config = convict(schema);

config.loadFile([
  path.resolve(__dirname, './config/common.json'),
  path.resolve(__dirname, `./config/${config.get('env')}.json`),
]);

config.validate({ allowed: 'strict' });

module.exports = config;