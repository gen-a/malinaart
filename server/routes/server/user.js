const router = require('express').Router();
const userController = require('../../controllers/user');
const { checkRequiredInBody } = require('../../lib/middlewares/check-required-in-body');

/** Add user route. */
router.post(
  '/',
  checkRequiredInBody(['email', 'password']),
  userController.add
);
/** Update user route. */
router.put('/:id', userController.update);
/** Find user by id. */
router.get('/:id', userController.findById);
/** Delete user by id. */
router.delete('/:id', userController.deleteById);

module.exports = router;
