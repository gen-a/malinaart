const { response } = require('../lib/response/response');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const mongoose = require('mongoose');
const passport = require('passport');
const validator = require('validator');
const jwt = require('../lib/jwt/index');
const { handleErrors } = require('../lib/response/errors-to-response');
const { ResourceNotFoundError, ValidationError } = require('../lib/errors');
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

  const email = { message: 'auth.error.emailIsRequired' };
  if (!req.body.email) {
    handleErrors('auth', new ValidationError('auth.error.validationError', { email }), res);
    return null;
  }

  if (!validator.isEmail(req.body.email)) {
    email.message = 'auth.error.emailIsInvalid';
    handleErrors('auth', new ValidationError('auth.error.validationError', { email }), res);
    return null;
  }

  User.findOne({ email: req.body.email })
    .then((document) => {
      if (document !== null) {
        res.status(200).json(response({ isNew: false }, 'auth.info.pleaseUsePasswordToEnter', 0));
      } else {
        const password = generatePassword();
        const email = req.body.email;

        const user = new User({ email, password, _id: new mongoose.Types.ObjectId() });
        return user.save()
          .then(() => sendRegistrationLetter(email, password))
          .then((info) => {
            res.status(200).json(response({ isNew: true }, 'auth.info.pleaseCheckEmailToEnter', 0));
          });
      }
    })
    .catch((err) => {
      handleErrors('auth', err, res, {});
    });
};


/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.login = (req, res, next) => {
  passport.authenticate(
    'local',
    {
      badRequestMessage: 'auth.error.missingCredentials',
      session: false
    },
    (err, user, info) => {

      if (err) {
        res.status(400).json(response(err, '', 1));
        return null;
      }

      if (!user) {
        handleErrors('auth', new ValidationError(info.message, {}), res);
        return null;
      }

      req.logIn(user, {session: false}, (err) => {
        if (err) {
          res.status(400).json(response(err, '', 1));
          return null;
        }
        const payload = user.toJSON();
        const jwtToken = jwt.sign(payload);
        const refreshToken = new RefreshToken({userId: user.id, _id: new mongoose.Types.ObjectId()});
        refreshToken.save()
          .then((data) => {
            res.status(200).json(response({
              user:payload,
              token:jwtToken,
              refreshToken:data.token
            }, 'auth.info.loggedInSuccessfully', 0));
          })
          .catch((err) => {
            handleErrors('auth', err, res, {});
          });
      });
    })(req, res, next);
  return null;


};
