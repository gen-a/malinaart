const mongoose = require('mongoose');
const validator = require('validator');
const requestIp = require('request-ip');

const { response } = require('../lib/response/response');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');

const jwt = require('../lib/jwt/index');
const fingerprintCookie = require('../lib/jwt/fingerprint-cookie');
const jwtRefresh = require('../lib/jwt/refresh');


const { handleErrors } = require('../lib/response/errors-to-response');
const { ResourceNotFoundError, ValidationError } = require('../lib/errors');
const { generatePassword } = require('../lib/password-generator');
const { sendRegistrationLetter } = require('../letters/send-registration-letter');
const { sendAccessLetter } = require('../letters/send-access-letter');


/**
 * Reset password of registered user
 * @param req
 * @param res
 * @returns {*}
 */
exports.resetPassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  User.findOne({ _id: new mongoose.Types.ObjectId(req.user.id) })
    .then((user) => {
      if (user === null) {
        /** If no refreshToken found throw error */
        throw new ResourceNotFoundError();
      }
      if (!user.comparePassword(oldPassword)) {
          /** If no refreshToken found throw error */
          throw new ValidationError('malformedRequest', { oldPassword: { message: 'isInvalid' } });
      }
      user.password = newPassword;
      return user.save();
    })
    .then((user) =>
      /** Remove all refresh tokens by user */
      RefreshToken.deleteMany({ userId: user.id })
    )
    .then(() => {
      res.status(200).json(response({}, 'savedSuccessfully', 0));
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};
/**
 * Show user data stored in token
 * @param req
 * @param res
 * @returns {*}
 */
exports.profile = (req, res) => {
  res.status(200).json(response(req.user, 'yourStoredData', 0));
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
    expires,
    token: jwtToken,
    refreshToken: refreshToken.token
  }, 'tokenIssuedSuccessfully', 0));

};


/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.retrieveToken = (req, res) => {
  const fingerprint = req.fingerprint.hash;
  const cookie = fingerprintCookie.read(req);

  authenticate(req.body.email, req.body.password)
    .then((user) => {
      /** remove all user + fingerprint tokens. */
      RefreshToken.deleteMany({ userId: user.id, fingerprint, cookie })
        .then(() => {
          /** Create and store new refresh token. */
          const refreshToken = new RefreshToken({
            _id: new mongoose.Types.ObjectId(),
            userId: user.id,
            token: jwtRefresh.token(),
            cookie,
            fingerprint: fingerprint,
            issuedAt: new Date().getTime(),
            expiresAt: new Date().getTime() + jwtRefresh.expiresIn,
          });
          return refreshToken.save()
            .then((data) => {
              sendJwtTokenResponse(res, user, data);
            })
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
  const { refreshToken: token } = req.body;
  const fingerprint = req.fingerprint.hash;
  const timeStamp = new Date().getTime();
  /** Get actual refreshToken data by request token and fingerprint */
  RefreshToken.findOne({ token, expiresAt: { $gte: timeStamp } })
    .then((document) => {

      if (document === null) {
        /** If no refreshToken found throw error */
        throw new ResourceNotFoundError();
      }
      /** Get user id from refreshToken */
      const userId = document.userId;
      /** Compare cookie */
      const cookie = fingerprintCookie.read(req);

      if (!fingerprintCookie.verify(req, document.cookie) || document.fingerprint !== fingerprint) {
        return RefreshToken.deleteMany({
          userId,
          $or: [{ cookie }, { fingerprint }, { expiresAt: { $lte: timeStamp } }]
        })
          .then(() => {
            /** Throw error */
            throw new ResourceNotFoundError();
          });
      } else {
        /** Count refreshTokens to clear if more than limited by user */
        return RefreshToken.countDocuments({ userId, expiresAt: { $gte: timeStamp } })
          .then((res) => {
            /** Set delete filter depending on by user limit */
            const filter = res > jwtRefresh.userLimit
              ? { _id: { $ne: new mongoose.Types.ObjectId(document.id) } }
              : { expiresAt: { $lte: timeStamp } };
            /** Clean up the tokens */
            return RefreshToken.deleteMany({ userId, ...filter });
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
            document.token = jwtRefresh.token();
            document.expiresAt = jwtRefresh.expiresIn;
            document.save()
              .then((data) => {
                sendJwtTokenResponse(res, user, data);
              });
          });
      }
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};