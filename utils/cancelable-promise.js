/**
 * Create cancelable promise
 * @param promise
 * @returns {{promise: (function(): Promise), cancel: (function())}}
 */
export const cancelablePromise = (promise) => {
  let canceled = false;

  const resolveIt = (resolve, reject) => (val) => {
    if (canceled) {
      return reject({ canceled });
    }
    return resolve(val);
  };

  const rejectIt = (reject) => (err) => {
    if (canceled) {
      return reject({ canceled });
    }
    return reject(err);
  };

  const wrapped = new Promise((resolve, reject) => {
    promise.then(resolveIt(resolve, reject));
    promise.catch(rejectIt(reject));
  });

  return {
    promise: () => wrapped,
    cancel: () => {
      canceled = true;
    }
  };
};
