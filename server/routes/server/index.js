const router = require('express').Router();
const { response } = require('../../lib/response/response');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const { ResourceNotFoundError } = require('../../lib/errors');
const { handleErrors } = require('../../lib/response/errors-to-response');

router.use('/user', userRoutes);
router.use('/auth', authRoutes);

router.get('/', (req, res) => {
  res.status(200).json(response({foo: 'result'}, '', 0));
  return null;
});

router.use('*', (req, res) => {
  handleErrors('api', new ResourceNotFoundError(), res, {});
});

module.exports = router;