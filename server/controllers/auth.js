const mongoose = require('mongoose');
const passport = require('passport');
const validator = require('validator');
const requestIp = require('request-ip');

const { response } = require('../lib/response/response');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const jwt = require('../lib/jwt/index');
const { handleErrors } = require('../lib/response/errors-to-response');
const { ResourceNotFoundError, ValidationError, MissingCredentialsError } = require('../lib/errors');
const { generatePassword } = require('../lib/password-generator');
const { sendRegistrationLetter } = require('../letters/send-registration-letter');
const { sendAccessLetter } = require('../letters/send-access-letter');

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
    (err, user, info) => {

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

  const data = jwt.decode(req.body.token);
  if (data === null || !data.payload.id) {
    handleErrors(new ValidationError('malformedRequest', { token: { message: 'tokenIsInvalid' } }
    ), res);
    return null;
  }
  const userId = data.payload.id;
  RefreshToken.countDocuments({
    userId,
    expiresAt: { $gte: new Date() }
  })
    .then((res) => {

      const filter = res > jwt.refreshTokenUserLimit
        ? { userId }
        : { userId, expiresAt: { $lte: new Date() } };

      return RefreshToken.deleteMany(filter);
    })
    .then(() => (
      RefreshToken.findOne({
        token: req.body.refreshToken,
        userId,
        expiresAt: { $gte: new Date() }
      })
    ))
    .then((document) => {
      if (document === null) {
        throw new ResourceNotFoundError();
      }
      User.findOne({ _id: new mongoose.Types.ObjectId(userId) })
        .then((user) => {
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