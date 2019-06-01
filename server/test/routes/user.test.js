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
          predict.response(res, 'duplicateUniqueKey', 1, 409);
          predict.failedParameters(res, {
            email: 'duplicateValue'
          });
          done();
        });
    });

    it('Should fail if missing email and password', (done) => {
      request(app)
        .post('/api/user')
        .send({})
        .end((err, res) => {
          predict.response(res, 'missingRequiredParameters', 1, 422);
          predict.failedParameters(res, {
            email: 'missingValue',
            password: 'missingValue',
          });
          done();
        });
    });


    it('Should fail if invalid email', (done) => {
          request(app)
        .post('/api/user')
        .send({...user.data, email: 'foo'})
        .end((err, res) => {
          predict.response(res, 'malformedRequest', 1, 422);
          predict.failedParameters(res, {
            email: 'emailIsInvalid'
          });
          done();
        });
    });

  });

  describe('GET api/user/:id', () => {

    it('Should succeed with valid user id', (done) => {
      request(app)
        .get(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'foundSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with invalid user id', (done) => {
      request(app)
        .get(`/api/user/111`)
        .end((err, res) => {
          predict.response(res, 'malformedRequest', 1, 422);
          predict.failedParameters(res, {
            id: 'userIdIsInvalid'
          });
          done();
        });
    });

  });

  describe('DELETE api/user/:id', () => {

    it('Should failed with invalid user id', (done) => {
      request(app)
        .delete(`/api/user/111`)
        .end((err, res) => {
          predict.response(res, 'malformedRequest', 1, 422);
          predict.failedParameters(res, {
            id: 'userIdIsInvalid'
          });
          done();
        });
    });

    it('Should succeed with valid user id', (done) => {
      request(app)
        .delete(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'deletedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with not existing document', (done) => {
      request(app)
        .delete(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'resourceNotFound', 1, 404);
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
