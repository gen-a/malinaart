const router = require('express').Router();
const { checkUserInRequest } = require('../lib/middlewares/check-user-in-request');
const { checkRequiredInBody } = require('../lib/middlewares/check-required-in-body');
const userController = require('../controllers/user');

router.post('/add', userController.add);

/*
router.put('/profile', checkUserInRequest, usersController.updateProfile);
router.put('/password', checkUserInRequest, checkRequiredInBody(['password']), usersController.updatePassword);
router.get('/profile', checkUserInRequest, usersController.profile);
*/
router.use('/', (req, res, next) => {});
module.exports = router;
