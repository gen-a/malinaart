const { response } = require('./response');
/**
 * Convert mongoose error message to expected by front end
 * @param subject {String}
 * @param src
 */
exports.validatorErrorToResponse = (subject, src) => {
  const data = {};
  if (src.errors) {
    const keys = Object.keys(src.errors);
    if (keys.length > 0) {
      keys.forEach((v) => {
        data[v] = src.errors[v].reason || src.errors[v].message;
      });
    }
  }
  return response(data, `${subject}.error.validationError`, 1);
};

/**
 * Convert mongoose error message to expected by front end
 * @param subject {String}
 * @param src {Object}
 * @param indexMap {Object}
 */
exports.duplicateKeyErrorToResponse = (subject, src, indexMap) => {
  const message = src.errmsg;
  const reg = new RegExp('index:\\s([^\\s]+)\\sdup\\skey:', 'i');
  const matches = message.match(reg);
  if (matches !== null) {
    return response({
      key: indexMap[matches[1]]
    }, `${subject}.error.duplicateKeyError`, 1);
  }
  return response(src, message, 1);
};

/**
 * Convert mongoose error message to expected by front end
 * @param subject {String}
 * @param err {Object} error object
 * @param res {Object} response object
 * @param indexMap {Object}
 */
exports.handleErrors = (subject, err, res, indexMap = {}) => {
  if(err.name && err.name === 'ResourceNotFoundError'){
    res.status(404).json(response({}, `${subject}.error.resourceNotFoundError`, 1));
    return null;
  }
  if(err.name && err.name === 'ValidationError'){
    res.status(422).json(this.validatorErrorToResponse(subject, err));
    return null;
  }
  if(err.name && err.name === 'DuplicateKeyError'){
    res.status(422).json(response({key: err.key}, `${subject}.error.duplicateKeyError`, 1));
    return null;
  }
  if(err.name && err.name === 'MongoError' && err.code === 11000 && err.errmsg.indexOf('duplicate key error') !== -1){
    res.status(409).json(this.duplicateKeyErrorToResponse(subject, err, indexMap));
    return null;
  }
  res.status(400).json(response(err, '', 1));
};
