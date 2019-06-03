/**
 * Required cookie-parser server running
 *
 */
const ms = require('ms');
const randToken = require('rand-token');
const config = require('../../config');

const name = 'fingerprint';

/**
 * Cookie fingerprint expiresAt
 */
const expires = new Date(Date.now() + ms(config.get('jwt.refreshKey.expiresIn')) * 1.5);

/**
 * Refresh token
 */
exports.middleware = (req, res, next) => {
  res.cookie(
    name,
    req.cookies[name] || randToken.uid(128),
    {
      expires,
      httpOnly: true
    }
  );
  next();
};
/**
 *
 * @param req {Object} Express request object
 * @param value {String}
 * @returns {Boolean}
 */
exports.verify = (req, value) => this.read(req) === value;
/**
 *
 * @param req {Object} Express request object
 * @returns {String}
 */
exports.read = (req) => req.cookies[name] || '';
