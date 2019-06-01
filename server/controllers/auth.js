const mongoose = require('mongoose');
const passport = require('passport');
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
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.retrieveToken = (req, res) => {
  passport.authenticate(
    'local',
    {
      badRequestMessage: 'error.missingCredentials',
      session: false
    },
    (err, user) => {

      if (err) {
        handleErrors(err, res);
        return null;
      }

      req.logIn(user, { session: false }, (err) => {
        if (err) {
          res.status(400).json(response(err, '', 1));
          return null;
        }
        /** Convert user mongoose object. */
        const payload = user.toJSON();
        /** Get expiration date of token for client. */
        const expires = new Date(Date.now() + jwt.expiresIn);
        /** Sign JWT token with user payload. */
        const jwtToken = jwt.sign(payload);
        /** Create and store refresh token. */
        const refreshToken = new RefreshToken({
          _id: new mongoose.Types.ObjectId(),
          issuedAt: new Date().getTime(),
          userId: user.id,
          token: jwt.refreshToken(),
          expiresAt: new Date().getTime() + jwt.refreshTokenExpiresIn
        });
        refreshToken.save()
          .then((data) => {
            /** Send response with tokens data. */
            res.status(200).json(response({
              user: payload,
              expires,
              token: jwtToken,
              refreshToken: data.token
            }, 'tokenRetrievedSuccessfully', 0));
          })
          .catch((err) => {
            handleErrors(err, res, {});
          });
      });
    })(req, res);
  return null;
};

/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.refreshToken = (req, res) => {
  /** Get refreshToken data by request */
  RefreshToken.findOne({
    token: req.body.refreshToken,
    expiresAt: { $gte: new Date() }
  })
    .then((document) => {
      /** If no refreshToken found throw error */
      if (document === null) {
        throw new ResourceNotFoundError();
      }
      /** Get user id from refreshToken */
      const userId = document.userId;
      /** Count refreshTokens to clear if more than limited by user */
      RefreshToken.countDocuments({
        userId,
        expiresAt: { $gte: new Date() }
      })
        .then((res) => {
          /** Set delete filter depending on by user limit */
          const filter = res > jwt.refreshTokenUserLimit
            ? { userId, token: { $not: req.body.refreshToken } }
            : { userId, expiresAt: { $lte: new Date() } };
          /** Clean up the tokens */
          return RefreshToken.deleteMany(filter);
        })
        .then(() =>
          /** Get User data */
          User.findOne({ _id: new mongoose.Types.ObjectId(userId)})
        )
        .then((user) => {
          /** If no user found throw error */
          if (user === null) {
            throw new ResourceNotFoundError();
          }
          /** Convert user mongoose object. */
          const payload = user.toJSON();
          /** Get expiration date of token for client. */
          const expiresAt = Date.now() + jwt.expiresIn;
          /** Sign JWT token with user payload. */
          const jwtToken = jwt.sign(payload);
          /** Create and store refresh token. */
          document.token = jwt.refreshToken();
          document.expiresAt = new Date().getTime() + jwt.refreshTokenExpiresIn;
          document.save()
            .then((data) => {
              /** Send response with tokens data. */
              res.status(200).json(response({
                user: payload,
                expiresAt,
                token: jwtToken,
                refreshToken: data.token
              }, 'tokenRefreshedSuccessfully', 0));
            });

        });
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};