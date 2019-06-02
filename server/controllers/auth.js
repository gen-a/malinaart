const mongoose = require('mongoose');
const validator = require('validator');
const requestIp = require('request-ip');

const { response } = require('../lib/response/response');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const jwt = require('../lib/jwt/index');
const { handleErrors } = require('../lib/response/errors-to-response');
const { ResourceNotFoundError, ValidationError } = require('../lib/errors');
const { generatePassword } = require('../lib/password-generator');
const { sendRegistrationLetter } = require('../letters/send-registration-letter');
const { sendAccessLetter } = require('../letters/send-access-letter');


exports.resetPassword = (req, res) => {
  res.status(200).json(response(req.user, 'pleaseUsePasswordToEnter', 0));
  return null;

};
/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.provideEmail = (req, res) => {

  User.findOne({ email: req.body.email })
    .then((document) => {
      if (document !== null) {
        res.status(200).json(response({ isNew: false }, 'info.pleaseUsePasswordToEnter', 0));
      } else {
        const password = generatePassword();
        const email = req.body.email;

        const user = new User({ email, password, _id: new mongoose.Types.ObjectId() });
        return user.save()
          .then(() => sendRegistrationLetter(email, password))
          .then((info) => {
            res.status(200).json(response({ isNew: true }, 'info.pleaseCheckEmailToEnter', 0));
          });
      }
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};

/**
 * Authenticate user
 * @param email {String}
 * @param password {String}
 * @return {Promise}
 */
const authenticate = (email, password) => (
  User.findOne({ email })
    .then((user) => {
      if (user === null) {
        throw new ValidationError('malformedRequest', { email: { message: 'incorrectUserName' } });
      }
      if (!user.comparePassword(password)) {
        throw new ValidationError('malformedRequest', { password: { message: 'incorrectPassword' } });
      }
      return user;
    })
);


const sendJwtTokenResponse = (res, user, refreshToken) => {

  /** Convert user mongoose object. */
  const { dateAdd, dateUpdate, ...payload } = user.toJSON();
  /** Add refresh token id */
  payload.refreshId = refreshToken.id;
  /** Get expiration date of token for client. */
  const expires = Date.now() + jwt.expiresIn;
  /** Sign JWT token with user payload. */
  const jwtToken = jwt.sign(payload);

  /** Send response with tokens data. */
  res.status(200).json(response({
    user: payload,
    expires,
    token: jwtToken,
    refreshToken: refreshToken.token,
    fingerprint: refreshToken.fingerprint,
  }, 'tokenIssuedSuccessfully', 0));

};


/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.retrieveToken = (req, res) => {

  authenticate(req.body.email, req.body.password)
    .then((user) => {
      /** Create and store refresh token. */
      const refreshToken = new RefreshToken({
        _id: new mongoose.Types.ObjectId(),
        userId: user.id,
        token: jwt.refreshToken(),
        fingerprint: jwt.fingerprint(),
        issuedAt: new Date().getTime(),
        expiresAt: new Date().getTime() + jwt.refreshTokenExpiresIn,
      });
      refreshToken.save()
        .then((data) => {
          sendJwtTokenResponse(res, user, data);
        })
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};


/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.refreshToken = (req, res) => {
  const { refreshToken: token, fingerprint } = req.body;
  const timeStamp = new Date().getTime();
  /** Get actual refreshToken data by request token and fingerprint */
  RefreshToken.findOne({ token, fingerprint, expiresAt: { $gte: timeStamp } })
    .then((document) => {
      if (document === null) {
        /** Remove all documents with same token/fingerprint and outdated */
        return RefreshToken.deleteMany({ $or: [{ fingerprint }, { token }] })
          .then(() => {
            /** If no refreshToken found throw error */
            throw new ResourceNotFoundError();
          });
      }
      /** Get user id from refreshToken */
      const userId = document.userId;
      /** Count refreshTokens to clear if more than limited by user */
      RefreshToken.countDocuments({ userId, expiresAt: { $gte: timeStamp } })
        .then((res) => {
          /** Set delete filter depending on by user limit */
          const filter = res > jwt.refreshTokenUserLimit
            ? { _id: { $ne: new mongoose.Types.ObjectId(document.id) } }
            : { expiresAt: { $lte: timeStamp } };
          /** Clean up the tokens */
          return RefreshToken.deleteMany({userId, ...filter});
        })
        .then(() =>
          /** Get User data */
          User.findOne({ _id: new mongoose.Types.ObjectId(userId) })
        )
        .then((user) => {
          /** If no user found throw error */
          if (user === null) {
            throw new ResourceNotFoundError();
          }
          /** Create and store refresh token. */
          document.token = jwt.refreshToken();
          document.expiresAt = timeStamp + jwt.refreshTokenExpiresIn;
          document.save()
            .then((data) => {
              sendJwtTokenResponse(res, user, data);
            });
        });
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};