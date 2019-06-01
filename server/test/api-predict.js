const { expect } = require('chai');

/**
 * Expected failed parameters
 * @param res {object}
 * @param parameters {object}
 */
exports.failedParameters = (res, parameters) => {
  expect(res.body.data).to.have.property('errors');
  Object.keys(parameters).forEach((p)=>{
    expect(res.body.data.errors).to.have.property(p);
    expect(res.body.data.errors[p]).to.have.property('message');
    expect(res.body.data.errors[p].message).to.equal(parameters[p]);
  });
};

/**
 * Expected response
 * @param res {object}
 * @param message {string}
 * @param error {number}
 * @param status {number}
 */
exports.response = (res, message, error, status = 200) => {
  expect(res.statusCode).to.equal(status);
  expect(res.body).to.be.an('object');
  expect(res.body).to.have.all.keys(['data', 'message', 'error']);
  expect(res.body.error).to.equal(error);
  expect(res.body.message).to.equal(message);
  expect(res.body.data).to.be.an('object');
};
/**
 * Expected response
 * @param res {object}
 */
exports.responseRecords = (res) => {
  expect(res.body.data.perPage).to.be.a('number');
  expect(res.body.data.page).to.be.a('number');
  expect(res.body.data.count).to.be.a('number');
  expect(res.body.data.pagesTotal).to.be.a('number');
  expect(res.body.data.filters).to.be.an('object');
  expect(res.body.data.records).to.be.an('array');
};