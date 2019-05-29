/**
 * Replace placeholdres in route path with given data
 * @param route {String}
 * @param data {object}
 * @returns {*}
 */
export const replaceInRoute = (route, data) => {
  let result = route;
  Object.keys(data).forEach((k) => {
    result = result.replace(new RegExp(`:${k}`), data[k]);
  });
  return result;
};
/**
 * Clear placeholders in route path
 * @param route {String} - source string that contains placeholders
 * @param keep {Array} - array of the names to be kept
 * @returns {*}
 */
export const clearPlaceholdersInRoute = (route, keep) => {
  let result = route;
  const keys = route.split('/').filter(m => m.substr(0, 1) === ':').map(m => m.substr(1));
  if (keys.length > 0) {
    keys.forEach((key) => {
      if (!keep.includes(key)) {
        result = result.replace(new RegExp(`/${key}/:${key}`), '');
        result = result.replace(new RegExp(`/:${key}`), '');
      }
    });
  }
  return result;
};

/**
 * Convert search object to string
 * @param search {object}
 * @returns {String}
 */
export const searchToString = (search) => {
  const keys = Object.keys(search);
  keys.sort();
  if (keys.length > 0) {
    const result = [];
    Object.keys(search).forEach((key) => {
      result.push(`${key}=${encodeURIComponent(search[key])}`);
    });
    return `?${result.join('&')}`;
  }
  return '';
};

/**
 * Build url by given ruoute path and replacements parameters
 * @param route {String} - source string that contains placeholders
 * @param data {object} - data for placing into path
 * @param search {object} - data for search string
 * @returns {*}
 */
export const buildUrl = (route, data, search = {}) => {
  const base = clearPlaceholdersInRoute(replaceInRoute(route, data), Object.keys(data));
  return `${base}${searchToString(search)}`;
};


