const { response } = require('../response/response');
/**
 *
 * @param keys
 */
exports.checkRequiredInBody = (keys) => (req, res, next) => {
  const failed = keys.filter(k => !req.body[k] || req.body[k] === '');
  if (failed.length === 0) {
    return next();
  }
  res.status(422).json(response({ failed }, 'error.missingRequiredParameters', 1));
  return null;
};