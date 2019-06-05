const { response } = require('./response');
/**
 * Convert mongoose error message to expected by front end
 * @param src
 */
exports.validatorErrorToResponse = (src) => {
  const errors = {};
  if (src.errors) {
    const keys = Object.keys(src.errors);
    if (keys.length > 0) {
      keys.forEach((v) => {
        errors[v] = {
          message: src.errors[v].reason || src.errors[v].message
        };
      });
    }
  }
  return response({ errors }, 'malformedRequest', 1);
};

/**
 * Convert mongoose error message to expected by front end
 * @param src {Object}
 * @param indexMap {Object}
 */
exports.duplicateKeyErrorToResponse = (src, indexMap) => {
  const message = src.errmsg;
  const reg = new RegExp('index:\\s([^\\s]+)\\sdup\\skey:', 'i');
  const matches = message.match(reg);
  if (matches !== null) {
    const errors = {};
    errors[indexMap[matches[1]]] = {
      message: 'duplicateValue'
    };
    return response({ errors }, 'duplicateUniqueKey', 1);
  }
  return response(src, message, 1);
};

/**
 * Convert mongoose error message to expected by front end
 * @param err {Object} error object
 * @param res {Object} response object
 * @param indexMap {Object}
 */
exports.handleErrors = (err, res, indexMap = {}) => {
  const errors = {};
  if (err.name && err.name === 'DocumentNotFoundError') {
    res.status(404).json(response({}, err.message || 'documentNotFound', 1));
    return null;
  }
  if (err.name && err.name === 'ResourceNotFoundError') {
    res.status(404).json(response({}, 'resourceNotFound', 1));
    return null;
  }
  if (err.name && err.name === 'DuplicateKeyError') {
    errors[err.key] = {
      message: 'duplicateValue'
    };
    res.status(422).json(response({ errors }, 'duplicateUniqueKey', 1));
    return null;
  }
  /** Mongoose errors */
  if (err.name && err.name === 'ValidationError') {
    res.status(422).json(this.validatorErrorToResponse(err));
    return null;
  }
  if (err.name && err.name === 'MongoError' && err.code === 11000 && err.errmsg.indexOf('duplicate key error') !== -1) {
    res.status(409).json(this.duplicateKeyErrorToResponse(err, indexMap));
    return null;
  }
  /** General errors */
  res.status(400).json(response(err, err.message, 1));
};

