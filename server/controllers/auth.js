const { response } = require('../lib/response/response');
const User = require('../models/user');
const mongoose = require('mongoose');
const validator = require('validator');
const { handleErrors } = require('../lib/response/errors-to-response');
const { ResourceNotFoundError, ValidationError } = require('../lib/errors');
const { generatePassword } = require('../lib/password-generator');
const { sendRegistrationLetter } = require('../letters/send-registration-letter');
const { sendAccessLetter } = require('../letters/send-access-letter');


/**
 * Add user to collection
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.provideEmail = (req, res, next) => {

  const email = { message: 'auth.error.emailIsRequired' };
  if (!req.body.email) {
    handleErrors('auth', new ValidationError('auth.error.validationError', { email }), res);
    return;
  }

  if (!validator.isEmail(req.body.email)) {
    email.message = 'auth.error.emailIsInvalid';
    handleErrors('auth', new ValidationError('auth.error.validationError', { email }), res);
    return;
  }

  User.findOne({ email: req.body.email })
    .then((document) => {
      if (document !== null) {
        res.status(200).json(response({ isNew: false }, 'auth.info.pleaseUsePasswordToEnter', 0));
      }else{
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
      handleErrors('auth', err, res, { email_1: 'email' });
      next();
    });
};
