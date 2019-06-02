const { response } = require('../response/response');
/**
 *
 * @param keys
 */
module.exports = (keys) => (req, res, next) => {
  const errors = {};
  keys.forEach((k)=>{
    if(!req.body[k] || req.body[k] === ''){
      errors[k] = {
        message: 'missingValue'
      }
    }
  });
  if (Object.keys(errors).length === 0) {
    return next();
  }
  res.status(422).json(response({ errors }, 'missingRequiredParameters', 1));
  return null;
};