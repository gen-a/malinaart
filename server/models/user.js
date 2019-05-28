const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  dateAdd: {
    type: Number
  },
  dateUpdate: {
    type: Number
  },
  visa: {
    type: String
  },
  visaExpirationDate: {
    type: Number
  },
  email: {
    type: String,
    required: [true, 'user.error.emailIsRequired'],
    unique: true,
    validate: {
      validator:function(v) {
        return new Promise(function(resolve, reject) {
          validator.isEmail(v)
            ? resolve()
            : reject('user.error.emailIsInvalid');
        });
      },
      message: 'user.error.emailIsInvalid'
    }
  },
  password: {
    type: String,
    required: [true, 'user.error.passwordIsRequired'],
    minlength: [6, 'user.error.passwordToShort'],
    maxlength: [12, 'user.error.passwordToLong'],
    validate: {
      validator: (v) => v.match(/\s/) === null,
      message: 'user.error.passwordNoSpaceAllowed'
    }
  }
});

userSchema.options.toJSON = {
  transform: (doc, ret, options) => {
    ret.id = ret._id + '';
    ret.dateAdd = new Date(new Date().setTime(ret.dateAdd)).toUTCString();
    ret.dateUpdate = new Date(new Date().setTime(ret.dateUpdate)).toUTCString();
    delete ret.password;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

function hashPassword(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
  }
  next();
}

function addDateUpdate(next) {
  const user = this;
  user.dateUpdate = new Date().getTime();
  next();
}

function addDateAdd(next) {
  const user = this;
  if (!user.dateAdd) {
    user.dateAdd = new Date().getTime();
  }
  next();
}

userSchema.pre('save', addDateAdd);

userSchema.pre('save', addDateUpdate);

userSchema.pre('save', hashPassword);

function comparePassword(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
}

userSchema.methods.comparePassword = comparePassword;

module.exports = mongoose.model('User', userSchema, 'users');
