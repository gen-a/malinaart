const mongoose = require('mongoose');
const jwt = require('../lib/jwt/index');

const refreshTokenSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  token: {
    type: String
  },
  issuedAt: {
    type: Number
  },
  expiresAt: {
    type: Number
  },
  userId: {
    type: String,
    required: [true, 'userIdIsRequired'],
  }
});

refreshTokenSchema.options.toJSON = {
  transform: (doc, ret, options) => {
    ret.id = ret._id + '';
    ret.issuedAt = new Date(new Date().setTime(ret.issuedAt)).toUTCString();
    ret.expiresAt = new Date(new Date().setTime(ret.expiresAt)).toUTCString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema, 'refreshTokens');
