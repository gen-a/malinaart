const router = require('express').Router();
const { checkUserInRequest } = require('../lib/middlewares/check-user-in-request');
const { checkRequiredInBody } = require('../lib/middlewares/check-required-in-body');
const userController = require('../controllers/user');

/** Add user route. */
router.post('/', userController.add);
/** Update user route. */
router.put('/:id', userController.update);
/** Find user by id. */
router.get('/:id', userController.findById);
/** Delete user by id. */
router.delete('/:id', userController.deleteById);

/*
router.put('/profile', checkUserInRequest, usersController.updateProfile);
router.put('/password', checkUserInRequest, checkRequiredInBody(['password']), usersController.updatePassword);
router.get('/profile', checkUserInRequest, usersController.profile);
*/

router.use('/', (req, res, next) => {});
module.exports = router;
