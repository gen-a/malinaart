const request = require('supertest');
const chai = require('chai');
const app = require('../app');
const user = require('../user');
const predict = require('../api-predict');
const { expect } = require('chai');
const { exitIfNotTest } = require('../../lib/env-params');

exitIfNotTest();

describe('/routes/user.js API Integration Tests', function(){

  /** Required timeout for executing async mongoose requests. */
  this.timeout(5000);

  /** Prepare db collection. */
  before((done) => {
    user.connect()
      .then(()=>user.remove())
      .then(()=>{done()})
      .catch(console.log);
  });

  let addedUserData = {};

  describe('POST /api/user', () => {

    it('Should succeed with valid data', (done) => {
      request(app)
        .post('/api/user')
        .send({...user.data})
        .end((err, res) => {
          addedUserData = res.body.data;
          predict.response(res, 'info.addedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should fail if missing for duplicate email', (done) => {
      request(app)
        .post('/api/user')
        .send({...user.data})
        .end((err, res) => {
          predict.response(res, 'error.duplicateKeyError', 1, 409);
          expect(res.body.data).to.have.property('key');
          expect(res.body.data.key).to.equal('email');
          done();
        });
    });

    it('Should fail if missing or invalid password or email', (done) => {
          request(app)
        .post('/api/user')
        .send({email: 'foo'})
        .end((err, res) => {
          predict.response(res, 'error.validationError', 1, 422);
          done();
        });
    });

  });

  describe('GET api/user/:id', () => {

    it('Should succeed with valid user id', (done) => {
      request(app)
        .get(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'info.foundSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with invalid user id', (done) => {
      request(app)
        .get(`/api/user/111`)
        .end((err, res) => {
          predict.response(res, 'error.validationError', 1, 422);
          done();
        });
    });

  });

  describe('DELETE api/user/:id', () => {

    it('Should failed with invalid user id', (done) => {
      request(app)
        .delete(`/api/user/111`)
        .end((err, res) => {
          predict.response(res, 'error.validationError', 1, 422);
          done();
        });
    });

    it('Should succeed with valid user id', (done) => {
      request(app)
        .delete(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'info.deletedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with not existing document', (done) => {
      request(app)
        .delete(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'error.resourceNotFoundError', 1, 404);
          done();
        });
    });

  });

  after((done) => {
    user.remove()
      .then(() => done())
      .catch(console.log);
  });
});
