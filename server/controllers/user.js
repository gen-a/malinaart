const { response } = require('../lib/response/response');
const User = require('../models/user');
const mongoose = require('mongoose');
const { handleErrors } = require('../lib/response/errors-to-response');
const { ResourceNotFoundError, ValidationError } = require('../lib/errors');
/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.add = (req, res ) => {
  const { email, password } = req.body;
  const newUser = new User({ email, password, _id: new mongoose.Types.ObjectId() });

  newUser.save()
    .then((result) => {
      res.status(200).json(response(result, 'info.addedSuccessfully', 0));
    })
    .catch((err) => {
      handleErrors(err, res, { email_1: 'email' });
    });

};
/**
 * Add user to collection
 * @param req
 * @param res
 * @returns {*}
 */
exports.update = (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    handleErrors(new ValidationError('malformedRequest', { id:{message:'userIdIsInvalid'} }), res);
    return;
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
      res.status(200).json(response(result, 'updatedSuccessfully', 0));
    })
    .catch((err) => {
      handleErrors( err, res, { email_1: 'email' });
    });

};
/**
 * Find user by id
 * @param req
 * @param res
 * @returns {*}
 */
exports.findById = (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    handleErrors(new ValidationError('malformedRequest', { id:{message:'userIdIsInvalid'} }), res);
    return;
  }

  User.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .then((document) => {
      if (document === null) {
        throw new ResourceNotFoundError();
      }
      res.status(200).json(response(document, 'foundSuccessfully', 0));
    })
    .catch((err) => {
      handleErrors(err, res, { email_1: 'email' });
    });

};

/**
 * Delete user by id
 * @param req
 * @param res
 * @returns {*}
 */
exports.deleteById = (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    handleErrors(new ValidationError('malformedRequest', { id:{message:'userIdIsInvalid'} }), res);
    return;
  }

  User.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) })
    .then((result) => {
      if (result.deletedCount === 0) {
        throw new ResourceNotFoundError();
      }
      res.status(200).json(response({}, 'deletedSuccessfully', 0));
    })
    .catch((err) => {
      handleErrors(err, res, { email_1: 'email' });
    });

};