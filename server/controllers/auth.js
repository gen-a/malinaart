const mongoose = require('mongoose');
const validator = require('validator');
const requestIp = require('request-ip');

const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const RestoreToken = require('../models/restoreToken');

const authenticate = require('../lib/auth/authenticate');

const jwt = require('../lib/jwt/index');
const fingerprintCookie = require('../lib/jwt/fingerprint-cookie');
const jwtRefresh = require('../lib/jwt/refresh');

const ms = require('ms');
const config = require('../config');

const { response } = require('../lib/response/response');
const { handleErrors } = require('../lib/response/errors-to-response');
const { ValidationError, DocumentNotFoundError } = require('../lib/errors');
const { generatePassword } = require('../lib/password-generator');
const { mailOnRegistration, mailOnRestore, mailOnRestorePassword } = require('../letters/index');


/**
 * Generate mongoose id
 * @param value
 * @returns (mongoose.Types.ObjectId)
 */
const objectId = (value) => new mongoose.Types.ObjectId(value);

/**
 * Find user in database
 * @param filter
 */
const findUser = (filter) => (
  User.findOne(filter)
    .then((user) => {
      if (user === null) {
        throw new DocumentNotFoundError('userDocumentNotFound');
      }
      return user;
    })
);

/**
 * Send new jwt token
 * @param res {Object}
 * @param user {Object}
 * @param refreshToken {Object}
 * @returns {Promise}
 */
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
 * Create new refresh token
 * @param userId {String}
 * @param cookie {String}
 * @param fingerprint {String}
 * @returns {Promise}
 */
const createNewRefreshToken = (userId, cookie, fingerprint) => (
  new RefreshToken({
    _id: objectId(),
    userId,
    token: jwtRefresh.token(),
    cookie,
    fingerprint,
    issuedAt: new Date().getTime(),
    expiresAt: new Date().getTime() + jwtRefresh.expiresIn,
  })
);
/**
 * Reset password of registered user
 * @param req
 * @param res
 * @returns {*}
 */
exports.changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;
  findUser({ _id: objectId(req.user.id) })
    .then((user) => {
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
 * Sign user and send email with password (for not registered) or ask to enter password.
 * @param req
 * @param res
 * @returns {*}
 */
exports.sign = (req, res) => {
  const waitingTime = ms(config.get('auth.confirmWaitingTime'));
  const { email } = req.body;
  const {
    schema: {
      tree: {
        role: { default: role },
        password: { minlength: [minLength], maxlength: [maxLength] },
      }
    }
  } = User;
  /** Delete all outdated records with default user role (not confirmed by logging in) */
  User.deleteMany({ role, dateAdd: { $lte: new Date().getTime() - waitingTime } })
  /** Find user by given email */
    .then(() => User.findOne({ email }))
    .then((user) => {
      /** If user not found create new user record */
      if (user === null) {
        const password = generatePassword(minLength, maxLength);
        user = new User({ email, password, _id: objectId() });
        return user.save()
        /** Mail notification with newly created password */
          .then(() => mailOnRegistration(email, password))
          .then((info) => {
            res.status(200).json(response({ isNew: true }, 'pleaseCheckEmailToEnter', 0));
          });
      } else {
        if (user.role !== role) {
          res.status(200).json(response({ isNew: false }, 'pleaseUsePasswordToEnter', 0));
        } else {
          res.status(200).json(response({ isNew: true }, 'pleaseCheckEmailToEnter', 0));
        }
      }
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
exports.restore = (req, res) => {
  const { email } = req.body;
  findUser({ email })
    .then((user) => {
      const userId = user.id;
      RestoreToken.deleteOne({ _id: objectId(user.id) })
        .then(() => {
          const accessToken = new RestoreToken({
            _id: objectId(user.id),
            userId
          });
          accessToken.save()
            .then((document) => {
              mailOnRestore(user.email, document.token, document.expiresAt)
                .then(() => {
                  res.status(200).json(response({ email }, 'restoreLetterHasBeenSent', 0));
                });
            });
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
exports.restoreAccess = (req, res) => {
  const fingerprint = req.fingerprint.hash;
  const cookie = fingerprintCookie.read(req);
  const {
    schema: {
      tree: {
        password: { minlength: [minLength], maxlength: [maxLength] },
      }
    }
  } = User;

  authenticate.ByRestoreToken(req.body.token)
    .then((user) => {
      const password = generatePassword(minLength, maxLength);
      user.password = password;
      return user.save()
      /** Mail notification with newly created password */
        .then(() => mailOnRestorePassword(email, password))
        .then((info) => (
          /** remove all user + fingerprint tokens. */
          RefreshToken.deleteMany({ userId: user.id })
            .then(() => {
              /** Create and store new refresh token. */
              return createNewRefreshToken(user.id, cookie, fingerprint)
                .save()
                .then((data) => {
                  return sendJwtTokenResponse(res, user, data);
                })
            })
        ));
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
exports.grantAccess = (req, res) => {
  const fingerprint = req.fingerprint.hash;
  const cookie = fingerprintCookie.read(req);

  authenticate.byPassword(req.body.email, req.body.password)
    .then((user) => {
      /** remove all user + fingerprint tokens. */
      RefreshToken.deleteMany({ userId: user.id, fingerprint, cookie })
        .then(() => {
          /** Create and store new refresh token. */
          return createNewRefreshToken(user.id, cookie, fingerprint)
            .save()
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
exports.refreshAccess = (req, res) => {
  const { refreshToken: token } = req.body;
  const fingerprint = req.fingerprint.hash;
  const timeStamp = new Date().getTime();
  /** Get actual refreshToken data by request token and fingerprint */
  RefreshToken.findOne({ token, expiresAt: { $gte: timeStamp } })
    .then((document) => {
      if (document === null) {
        throw new DocumentNotFoundError('refreshTokenDocumentNotFound');
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
            throw new DocumentNotFoundError('refreshTokenDocumentNotFound');
          });
      } else {
        /** Count refreshTokens to clear if more than limited by user */
        return RefreshToken.countDocuments({ userId, expiresAt: { $gte: timeStamp } })
          .then((res) => {
            /** Set delete filter depending on by user limit */
            const filter = res > jwtRefresh.userLimit
              ? { _id: { $ne: objectId(document.id) } }
              : { expiresAt: { $lte: timeStamp } };
            /** Clean up the tokens */
            return RefreshToken.deleteMany({ userId, ...filter });
          })
          .then(() =>
            /** Get User data */
            findUser({ _id: objectId(userId) })
          )
          .then((user) => {
            /** Create and store refresh token. */
            document.token = jwtRefresh.token();
            document.expiresAt = jwtRefresh.expiresIn;
            document.save()
              .then((data) => {
                return sendJwtTokenResponse(res, user, data);
              });
          });
      }
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};