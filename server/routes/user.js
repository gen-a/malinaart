const router = require('express').Router();
const userController = require('../controllers/user');

/** Add user route. */
router.post('/', userController.add);
/** Update user route. */
router.put('/:id', userController.update);
/** Find user by id. */
router.get('/:id', userController.findById);
/** Delete user by id. */
router.delete('/:id', userController.deleteById);

module.exports = router;
