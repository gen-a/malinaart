const mongoose = require('mongoose');
const db = require('../services/db');
const User = require('../models/user');

/**
 * Connect to db
 */
exports.connect = db.connect;

/**
 * New temporary User data
 * @type {{password: string, email: string}}
 */
exports.data = {
  password: '198yuiRTY',
  email: 'mallory25@ethereal.email'
};
/**
 * Create temporary user
 * @returns {*}
 */
exports.create = () => {
  const user = new User({
    ...exports.data,
    _id: new mongoose.Types.ObjectId()
  });
  return user.save();
};
/**
 * Remove temporary user
 * @returns {*}
 */
exports.remove = () => {
  const { data: { email } } = exports;
  return User.deleteOne({ email });
};