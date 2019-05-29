const router = require('express').Router();
const authController = require('../controllers/auth');

/** Sign In route. */
router.post('/provide-email', authController.provideEmail);

module.exports = router;
