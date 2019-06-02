const router = require('express').Router();
const authController = require('../../controllers/auth');
const checkRequired = require('../../lib/middlewares/check-required');
const authorize = require('../../lib/middlewares/authorize');
const fingerprint = require('../../lib/middlewares/fingerprint');
/** Sign In route. */
router.post(
  '/provide-email',
  checkRequired(['email']),
  authController.provideEmail
);

/** Log In route. */
router.post(
  '/retrieve-token',
  fingerprint(),
  checkRequired(['email', 'password']),
  authController.retrieveToken
);

/** Reset password route. */
router.post(
  '/reset-password',
  authorize(),
  //checkRequired(['oldPassword', 'newPassword']),
  authController.resetPassword
);

/** Refresh token. */
router.post(
  '/refresh-token',
  fingerprint(),
  checkRequired(['refreshToken']),
  authController.refreshToken
);

module.exports = router;
