const mongoose = require('mongoose');

const userSessionSchema = mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  data: {
    type: Object
  }
});

userSessionSchema.options.toJSON = {
  transform: (doc, ret, options) => {
    ret.id = ret._id + '';
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

module.exports = mongoose.model('UserSessions', userSessionSchema, 'userSessions');
