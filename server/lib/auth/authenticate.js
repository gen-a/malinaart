const mongoose = require('mongoose');

const User = require('../../models/user');
const RestoreToken = require('../../models/restoreToken');

const { DocumentNotFoundError, ValidationError } = require('../errors');

/**
 * Authenticate user
 * @param email {String}
 * @param password {String}
 * @return {Promise}
 */
const authenticateByPassword = (email, password) => (
  User.findOne({ email })
    .then((user) => {
      if (user === null) {
        throw new DocumentNotFoundError('userDocumentNotFound');
      }
      if (!user.comparePassword(password)) {
        throw new ValidationError('malformedRequest', { password: { message: 'incorrectPassword' } });
      }
      const role = User.schema.tree.role;

      if (user.role === role.default) {
        return User.updateOne({ email }, { $set: { role: role.enum[1] } })
          .then(() => user);
      } else {
        return user;
      }
    })
);
/**
 * Authenticate user by restore token
 * @param token {String}
 * @return {Promise}
 */
const authenticateByRestoreToken = (token) => {
  const timeStamp = new Date().getTime();
  return RestoreToken.findOne({ token, expiresAt: { $gte: timeStamp } })
    .then((document) => {
      if (document === null) {
        throw new DocumentNotFoundError('restoreTokenDocumentNotFound');
      }
      return User.findOne({ _id: new mongoose.Types.ObjectId(document.id) })
        .then((user) => {
          if (user === null) {
            /** If no refreshToken found throw error */
            throw new DocumentNotFoundError('userDocumentNotFound');
          }
          return RestoreToken.deleteMany({ $or: [{ _id: new mongoose.Types.ObjectId(document.id) }, { expiresAt: { $lte: timeStamp }}] })
            .then(() => user);
        })
    });
};


module.exports = {
  byPassword : authenticateByPassword,
  ByRestoreToken : authenticateByRestoreToken,
};