const { response } = require('../lib/response/response');
const User = require('../models/user');
const mongoose = require('mongoose');
const { handleErrors } = require('../lib/response/errors-to-response');
const { ResourceNotFoundError } = require('../lib/errors');
/**
 * Add user to collection
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.add = (req, res, next) => {
  const { email, password } = req.body;
  const newUser = new User({ email, password, _id: new mongoose.Types.ObjectId() });

  newUser.save()
    .then((result) => {
      res.status(200).json(response(result, 'user.info.addedSuccessfully', 0));
      next();
    })
    .catch((err) => {
      handleErrors('user', err, res, { email_1: 'email' });
      next();
    });

};
/**
 * Add user to collection
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.update = (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    handleErrors('user', new ResourceNotFoundError(), res, { email_1: 'email' });
    return next();
  }

  User.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .then((document) => {
      if (document === null) {
        throw new ResourceNotFoundError();
      }
      ['email', 'password'].forEach((k) => {
        if (req.body.hasOwnProperty(k)) {
          document[k] = req.body[k];
        }
      });
      return document.save();
    })
    .then((result) => {
      res.status(200).json(response(result, 'user.info.updatedSuccessfully', 0));
      next();
    })
    .catch((err) => {
      handleErrors('user', err, res, { email_1: 'email' });
      next();
    });

};
/**
 * Find user by id
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.findById = (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    handleErrors('user', new ResourceNotFoundError(), res, { email_1: 'email' });
    return next();
  }

  User.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .then((document) => {
      if (document === null) {
        throw new ResourceNotFoundError();
      }
      res.status(200).json(response(document, 'user.info.foundSuccessfully', 0));
      next();
    })
    .catch((err) => {
      handleErrors('user', err, res, { email_1: 'email' });
      next();
    });

};

/**
 * Delete user by id
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.deleteById = (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    handleErrors('user', new ResourceNotFoundError(), res, { email_1: 'email' });
    return next();
  }

  User.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .then((result) => {
      if (result.deletedCount === 0) {
        throw new ResourceNotFoundError();
      }
      res.status(200).json(response({}, 'user.info.deletedSuccessfully', 0));
      next();
    })
    .catch((err) => {
      handleErrors('user', err, res, { email_1: 'email' });
      next();
    });

};