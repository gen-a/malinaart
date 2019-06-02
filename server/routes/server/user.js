const router = require('express').Router();
const userController = require('../../controllers/user');
const checkRequired = require('../../lib/middlewares/check-required');
console.log(checkRequired);
/** Add user route. */
router.post(
  '/',
  checkRequired(['email', 'password']),
  userController.add
);
/** Update user route. */
router.put('/:id', userController.update);
/** Find user by id. */
router.get('/:id', userController.findById);
/** Delete user by id. */
router.delete('/:id', userController.deleteById);

module.exports = router;
