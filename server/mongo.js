const User = require('./models/user');
const { connect } = require('./db');
const mongoose = require('mongoose');

connect()
  .then((res) => {
    User.create({
      _id: mongoose.Types.ObjectId(),
      password: '198yuiRTY',
      email: 'nouniqueemail@gmail.com'
    },function (err) {
      if (err) return console.log(err);
      console.log('saved ')
    });
  })
  .catch(console.log);




