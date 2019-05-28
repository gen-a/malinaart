const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const expressJwt = require('express-jwt');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
/**
 * http://travistidwell.com/jsencrypt/demo/ - online key generator
 * const privateKey = fs.readFileSync(path.resolve(__dirname, './private.key'), 'utf8');
 */
const privateKey = process.env.JWT_PRIVATE_KEY;
const publicKey = fs.readFileSync(path.resolve(__dirname, './public.key'), 'utf8');

const signOptions = {
  /** Software organization who issues the token. */
  issuer: '48Ukraine',
  /** Intended user of the token. */
  subject: 'some@user.com',
  /** Basically identity of the intended recipient of the token. */
  audience: 'http://48ukraine.com',
  /** Expiration time after which the token will be invalid. */
  expiresIn: '12h',
  /** Encryption algorithm to be used to protect the token. */
  algorithm: 'RS256'
};

const verifyOptions = { ...signOptions, algorithm: [signOptions.algorithm] };

/**
 * Node Express JWT check middleware
 * expect header {Authorization : 'Bearer JWT_TOKEN'}
 * ex.:
 * axios.defaults.headers.common['Authorization'] = 'Bearer ' + JWT_TOKEN;
 */
exports.jwtCheck = expressJwt({
  secret: publicKey,
  issuer: signOptions.issuer,
  subject: signOptions.subject,
  audience: signOptions.audience,
});

/**
 * Create new JWT token
 * @param payload {object}
 * @returns {string}
 */
exports.sign = (payload) => {
  return jwt.sign(payload, privateKey, signOptions);
};

/**
 * Verify JWT token
 * @param token {string}
 * @returns {object}
 */
exports.verify = (token) => {
  return jwt.verify(token, publicKey, verifyOptions);
};

/**
 * Decode JWT token
 * @param token
 * @returns {object}
 */
exports.decode = (token) => {
  return jwt.decode(token, { complete: true });
};
