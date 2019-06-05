const router = require('express').Router();
const authController = require('../../controllers/auth');
const checkRequired = require('../../lib/middlewares/check-required');
const authorize = require('../../lib/middlewares/authorize');
const fingerprint = require('../../lib/middlewares/fingerprint');

/** Sign In/Up route. */
router.post(
  '/sign',
  checkRequired(['email']),
  authController.sign
);

/** Log In route. */
router.post(
  '/grant-access',
  fingerprint(),
  checkRequired(['email', 'password']),
  authController.grantAccess
);

/** Reset password route. */
router.get(
  '/profile',
  authorize(),
  authController.profile
);

/** Refresh token. */
router.post(
  '/refresh-access',
  fingerprint(),
  checkRequired(['refreshToken']),
  authController.refreshAccess
);

/** Change password. */
router.put(
  '/password',
  authorize(),
  checkRequired(['newPassword', 'oldPassword']),
  authController.changePassword
);

/** Restore forgotten password. Ask for restore token. */
router.post(
  '/restore',
  checkRequired(['email']),
  authController.restore
);

/** Restore access by restore token. */
router.post(
  '/restore-access',
  fingerprint(),
  checkRequired(['token']),
  authController.restoreAccess
);

module.exports = router;
