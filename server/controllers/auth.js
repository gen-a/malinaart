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
exports.login = (req, res) => {
  passport.authenticate(
    'local',
    {
      badRequestMessage: 'error.missingCredentials',
      session: false
    },
    (err, user, info) => {

      if (err) {
        res.status(400).json(response(err, '', 1));
        return null;
      }

      if (!user) {
        handleErrors(new MissingCredentialsError(info.message, {}), res);
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
          userId: user.id,
          _id: new mongoose.Types.ObjectId(),
          fingerprint: req.body.fingerprint || requestIp.getClientIp(req)
        });
        refreshToken.save()
          .then((data) => {
            /** Send response with tokens data. */
            res.status(200).json(response({
              user: payload,
              expires,
              token: jwtToken,
              refreshToken: data.token
            }, 'info.loggedInSuccessfully', 0));
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
  if(data===null || !data.payload.id){
    handleErrors(new ValidationError('error.validationError', { token: { message: 'error.tokenIsInvalid' } }
    ), res);
    return null;
  }

  RefreshToken.findOne({
    token: req.body.refreshToken,
    userId: data.payload.id,
    dateExpiration: { $gte: new Date() }
  })
    .then((document) => {
      if (document === null) {
        throw new ResourceNotFoundError();
      }
      User.findOne({ _id: new mongoose.Types.ObjectId(data.payload.id) })
        .then((user) => {
          if (user === null) {
            throw new ResourceNotFoundError();
          }
          /** Convert user mongoose object. */
          const payload = user.toJSON();
          /** Get expiration date of token for client. */
          const expires = new Date(Date.now() + jwt.expiresIn);
          /** Sign JWT token with user payload. */
          const jwtToken = jwt.sign(payload);
          /** Create and store refresh token. */

          document.save()
            .then((data) => {
              /** Send response with tokens data. */
              res.status(200).json(response({
                user: payload,
                expires,
                token: jwtToken,
                refreshToken: data.token
              }, 'info.tokenRefreshedSuccessfully', 0));
            });

        });
    })
    .catch((err) => {
      handleErrors(err, res, {});
    });
};