const randToken = require('rand-token');
const ms = require('ms');
const config = require('../../config');

/**
 * Refresh token limit time milliseconds
 */
exports.expiresIn = ms(config.get('jwt.refreshKey.expiresIn'));

/**
 * Refresh token limit by user id
 */
exports.userLimit = config.get('jwt.refreshKey.userLimit');
/**
 * Refresh token
 */
exports.token = () => randToken.uid(256);
