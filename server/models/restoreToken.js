const mongoose = require('mongoose');
const randToken = require('rand-token');
const ms = require('ms');
const jwt = require('../lib/jwt/index');
const config = require('../config');

const restoreTokenSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  userId: {
    type: String,
  },
  token: {
    type: String
  },
  expiresAt: {
    type: Number
  }
});

restoreTokenSchema.options.toJSON = {
  transform: (doc, ret, options) => {
    ret.id = ret._id + '';
    ret.issuedAt = new Date(new Date().setTime(ret.issuedAt)).toUTCString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};


function addToken(next) {
  if (!this.token) {
    this.token = randToken.uid(32);
  }
  next();
}

function addExpiresAt(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date().getTime() + ms(config.get('auth.restoreTokenExpiresIn'));
  }
  next();
}

restoreTokenSchema.pre('save', addToken);

restoreTokenSchema.pre('save', addExpiresAt);

module.exports = mongoose.model('RestoreToken', restoreTokenSchema, 'restoreTokens');
