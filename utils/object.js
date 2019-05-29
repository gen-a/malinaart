/**
 * Merge objects immutable
 * @param state {object}
 * @param data {object}
 * @returns {object}
 */
export const updateObj = (state, data) => {
  if (typeof (data) !== 'object') {
    return data;
  }
  const o = { ...state };
  Object.keys(data).forEach((k) => {
    o[k] = updateObj(o[k], data[k]);
  });
  return o;
};