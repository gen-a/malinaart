const router = require('express').Router();
const authController = require('../../controllers/auth');

/** Sign In route. */
router.post('/provide-email', authController.provideEmail);

/** Log In route. */
router.post('/login', authController.login);

module.exports = router;
