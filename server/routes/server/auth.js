const router = require('express').Router();
const authController = require('../../controllers/auth');
const { checkRequiredInBody } = require('../../lib/middlewares/check-required-in-body');

/** Sign In route. */
router.post(
  '/provide-email',
  checkRequiredInBody(['email']),
  authController.provideEmail
);

/** Log In route. */
router.post(
  '/login',
  checkRequiredInBody(['email', 'password']),
  authController.login
);

/** Refresh token. */
router.post(
  '/refresh-token',
  checkRequiredInBody(['token', 'refreshToken']),
  authController.refreshToken
);

module.exports = router;
