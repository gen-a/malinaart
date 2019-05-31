const { response } = require('./response');
/**
 * Convert mongoose error message to expected by front end
 * @param src
 */
exports.validatorErrorToResponse = (src) => {
  const data = {};
  if (src.errors) {
    const keys = Object.keys(src.errors);
    if (keys.length > 0) {
      keys.forEach((v) => {
        data[v] = src.errors[v].reason || src.errors[v].message;
      });
    }
  }
  return response(data, `error.validationError`, 1);
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
    return response({
      key: indexMap[matches[1]]
    }, `error.duplicateKeyError`, 1);
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
  if(err.name && err.name === 'ResourceNotFoundError'){
    res.status(404).json(response({}, `error.resourceNotFoundError`, 1));
    return null;
  }
  if(err.name && err.name === 'MissingCredentialsError'){
    res.status(422).json(response({...err.data}, err.message, 1));
    return null;
  }
  if(err.name && err.name === 'ValidationError'){
    res.status(422).json(this.validatorErrorToResponse(err));
    return null;
  }
  if(err.name && err.name === 'DuplicateKeyError'){
    res.status(422).json(response({key: err.key}, `error.duplicateKeyError`, 1));
    return null;
  }
  if(err.name && err.name === 'MongoError' && err.code === 11000 && err.errmsg.indexOf('duplicate key error') !== -1){
    res.status(409).json(this.duplicateKeyErrorToResponse(err, indexMap));
    return null;
  }
  res.status(400).json(response(err, '', 1));
};

