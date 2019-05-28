/**
 * Filter object by keys
 * @param src
 * @param keys
 * @returns {Promise}
 */
exports.filterByKeys = (src, keys) => {
  const result = {};
  keys.forEach((key) => {
    if (typeof(src[key]) !== 'undefined') {
      result[key] = src[key];
    }
  });
  return Promise.resolve(result);
};
