const fs = require('fs');
const jwt = require('jsonwebtoken');
const path = require('path');
const randToken = require('rand-token');
const ms = require('ms');
const config = require('../../config');

/**
 * http://travistidwell.com/jsencrypt/demo/ - online key generator
 */
const privateKey = config.get('jwt.privateKey');
const publicKey = config.get('jwt.publicKey');

const signOptions = {
  /** Software organization who issues the token. */
  issuer: config.get('jwt.issuer'),
  /** Intended user of the token. */
  subject: config.get('jwt.subject'),
  /** Basically identity of the intended recipient of the token. */
  audience: config.get('jwt.audience'),
  /** Expiration time after which the token will be invalid. */
  expiresIn: config.get('jwt.expiresIn'),
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
exports.extract = (header) =>{
  try{
    return this.verify(header.replace(/^Bearer /, ''));
  }catch(e){
    return null;
  }
};
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
/**
 * Public key
 */
exports.publicKey = publicKey;
/**
 * Expire in
 */
exports.expiresIn =  ms(config.get('jwt.expiresIn'));
/**
 * Refresh token
 */
exports.refreshToken = () => randToken.uid(256);
/**
 * Refresh token
 */
exports.fingerprint = () => randToken.uid(128);
/**
 * Refresh token limit time milliseconds
 */
exports.refreshTokenExpiresIn = ms(config.get('jwt.refreshKey.expiresIn'));

/**
 * Refresh token limit by user id
 */
exports.refreshTokenUserLimit = config.get('jwt.refreshKey.userLimit');
