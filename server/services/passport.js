const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const jwt = require('../lib/jwt/index');

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwt.publicKey
  },
  (payload, cb) => {
    return cb(null, payload);
  }
));

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  (username, password, done) => {
    User.findOne({ email: username })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: 'error.incorrectUserName' });
        }
        if (!user.comparePassword(password)) {
          return done(null, false, { message: 'error.incorrectPassword' });
        }
        return done(null, user);
      })
      .catch(console.log);
  }
));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id)
    .then((user) => {
      cb(null, user === null ? false : user.toJSON());
    })
    .catch(console.log);
});

module.exports = (server) => {
  server.use(passport.initialize());
  server.use(passport.session());
};