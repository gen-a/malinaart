const mongoose = require('mongoose');
const request = require('supertest');
const chai = require('chai');
const app = require('../../index');
const user = require('../user');
const predict = require('../api-predict');
const { expect } = require('chai');
const { exitIfNotTest } = require('../../lib/env-params');

exitIfNotTest();
/** To make Mongoose's default index build use createIndex() instead of ensureIndex() to avoid deprecation warnings. */
mongoose.set('useCreateIndex', true);

describe('/routes/user.js API Integration Tests', function(){

  /** Required timeout for executing async mongoose requests. */
  this.timeout(5000);

  /** Prepare db collection. */
  before((done) => {
    user.remove()
      .then((res) => {
        done();
      })
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
          predict.response(res, 'user.info.addedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should fail if missing for duplicate email', (done) => {
      request(app)
        .post('/api/user')
        .send({...user.data})
        .end((err, res) => {
          predict.response(res, 'user.error.duplicateKeyError', 1, 409);
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
          predict.response(res, 'user.error.validationError', 1, 422);
          done();
        });
    });

  });

  describe('GET api/user/:id', () => {

    it('Should succeed with valid user id', (done) => {
      request(app)
        .get(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'user.info.foundSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with invalid user id', (done) => {
      request(app)
        .get(`/api/user/111`)
        .end((err, res) => {
          predict.response(res, 'user.error.resourceNotFoundError', 1, 404);
          done();
        });
    });

  });

  describe('DELETE api/user/:id', () => {

    it('Should failed with invalid user id', (done) => {
      request(app)
        .delete(`/api/user/111`)
        .end((err, res) => {
          predict.response(res, 'user.error.resourceNotFoundError', 1, 404);
          done();
        });
    });

    it('Should succeed with valid user id', (done) => {
      request(app)
        .delete(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'user.info.deletedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with not existing document', (done) => {
      request(app)
        .delete(`/api/user/${addedUserData.id}`)
        .end((err, res) => {
          predict.response(res, 'user.error.resourceNotFoundError', 1, 404);
          done();
        });
    });

  });








  /*

  describe('PUT /data/user/profile', () => {
    it('should fail on for not logged in users', (done) => {
      request(app)
        .put('/data/user/profile')
        .send({})
        .end((err, res) => {
          predict.response(res, 'auth.error.noUserFound', 1, 404);
          done();
        });
    });
  });

  describe('GET /data/user/profile', () => {
    it('should fail on for not logged in users', (done) => {
      request(app)
        .get('/data/user/profile')
        .send({})
        .end((err, res) => {
          predict.response(res, 'auth.error.noUserFound', 1, 404);
          done();
        });
    });
  });

  describe('PUT /data/user/password', () => {
    it('should fail on for not logged in users', (done) => {
      request(app)
        .put('/data/user/password')
        .send({})
        .end((err, res) => {
          predict.response(res, 'auth.error.noUserFound', 1, 404);
          done();
        });
    });
  });
*/
  after((done) => {
    user.remove()
      .then(() => done())
      .catch(console.log);
  });
});
