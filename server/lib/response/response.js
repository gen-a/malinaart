/**
 * Build API structured response object
 * @param data {object} - data container
 * @param message {string} - server message
 * @param error {number} - error code number
 * @returns {{data: *, message: string, error: number}}
 */
exports.response = function buildResponse(data, message = '', error = 0) {
  return {
    data, message, error
  };
};

/**
 * Build error response from mongoose error data object
 * @param src {object}
 * @returns {*}
 */
exports.mongooseErrorToResponse = function buildResponseByMongooseErrorObject(src) {
  const data = {};
  if (src.errors) {
    const keys = Object.keys(src.errors);
    if (keys.length > 0) {
      keys.forEach((v) => {
        data[v] = src.errors[v].message;
      });
    }
  }
  return exports.response(data, src.message, 1);
};