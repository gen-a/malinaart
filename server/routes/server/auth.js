const router = require('express').Router();
const authController = require('../../controllers/auth');
const { checkRequiredInBody } = require('../../lib/middlewares/check-required-in-body');
const authorize = require('../../lib/middlewares/authorize');

/** Sign In route. */
router.post(
  '/provide-email',
  checkRequiredInBody(['email']),
  authController.provideEmail
);

/** Log In route. */
router.post(
  '/retrieve-token',
  checkRequiredInBody(['email', 'password']),
  authController.retrieveToken
);

/** Reset password route. */
router.post(
  '/reset-password',
  authorize(),
  //checkRequiredInBody(['oldPassword', 'newPassword']),
  authController.resetPassword
);

/** Refresh token. */
router.post(
  '/refresh-token',
  checkRequiredInBody(['refreshToken']),
  authController.refreshToken
);

module.exports = router;
