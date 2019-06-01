const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const jwt = require('../lib/jwt/index');
const { ValidationError } = require('../lib/errors');

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  (username, password, done) => {
    User.findOne({ email: username })
      .then((user) => {

        if (!user) {
          return done(
            new ValidationError(
              'malformedRequest',
              { email: { message: 'incorrectUserName' } }
            ),
            false,
            'error.incorrectUserName'
          );
        }
        if (!user.comparePassword(password)) {
          return done(
            new ValidationError(
              'malformedRequest',
              { password: { message: 'incorrectPassword' } }
            ),
            false,
            'error.incorrectPassword'
          );

        }
        return done(null, user);
      })
      .catch(console.log);
  }
));

module.exports = (server) => {
  server.use(passport.initialize());
  server.use(passport.session());
};