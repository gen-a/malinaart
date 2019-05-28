const router = require('express').Router();
const { response } = require('../lib/response/response');
const userRoutes = require('./user');

router.use('/user', userRoutes);

router.get('*', (req, res, next) => {
  res.status(200).json(response({foo: 'result'}, '', 0));
  return next();
});

router.use('/', (req, res, next) => {});

module.exports = router;