const mongoose = require('mongoose');
const jwt = require('../lib/jwt/index');

const refreshTokenSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  token: {
    type: String
  },
  fingerprint: {
    type: String
  },
  dateAdd: {
    type: Number
  },
  dateExpiration: {
    type: Number
  },
  userId: {
    type: String,
    required: [true, 'refreshToken.error.userIdIsRequired'],
  }
});

refreshTokenSchema.options.toJSON = {
  transform: (doc, ret, options) => {
    ret.id = ret._id + '';
    ret.dateAdd = new Date(new Date().setTime(ret.dateAdd)).toUTCString();
    ret.dateExpiration = new Date(new Date().setTime(ret.dateExpiration)).toUTCString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

function addToken(next) {
  const refreshToken = this;
  refreshToken.token = jwt.refreshToken();
  next();
}


function addDateExpiration(next) {
  const refreshToken = this;
  refreshToken.dateExpiration = new Date().getTime() + jwt.refreshTokenExpiresIn;
  next();
}

function addDateAdd(next) {
  const refreshToken = this;
  if (!refreshToken.dateAdd) {
    refreshToken.dateAdd = new Date().getTime();
  }
  next();
}

refreshTokenSchema.pre('save', addToken);

refreshTokenSchema.pre('save', addDateAdd);

refreshTokenSchema.pre('save', addDateExpiration);

module.exports = mongoose.model('RefreshToken', refreshTokenSchema, 'refreshTokens');
