const request = require('supertest');
const chai = require('chai');
const app = require('../app');
const user = require('../user');
const predict = require('../api-predict');
const { expect } = require('chai');
const { exitIfNotTest } = require('../../lib/env-params');

exitIfNotTest();


describe('/routes/auth.js API Integration Tests', function() {

  /** Required timeout for executing async mongoose requests. */
  this.timeout(5000);

  /** Prepare db collection. */
  before((done) => {
    user.connect()
      .then(() => user.remove())
      .then(() => user.create())
      .then((res) => {
        done();
      })
      .catch(console.log);
  });

  let authData;

  describe('POST /api/auth/retrieve-token', () => {

    it('Should fail if missing email or password', (done) => {
      request(app)
        .post('/api/auth/retrieve-token')
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

    it('Should fail if incorrect user name', (done) => {
      request(app)
        .post('/api/auth/retrieve-token')
        .send({ email: `_${user.data.email}`, password: user.data.password })
        .end((err, res) => {
          predict.response(res, 'malformedRequest', 1, 422);
          predict.failedParameters(res, {
            email: 'incorrectUserName'
          });
          done();
        });
    });

    it('Should fail if incorrect user password', (done) => {
      request(app)
        .post('/api/auth/retrieve-token')
        .send({ email: user.data.email, password: `_${user.data.password}` })
        .end((err, res) => {
          predict.response(res, 'malformedRequest', 1, 422);
          predict.failedParameters(res, {
            password: 'incorrectPassword'
          });
          done();
        });
    });

    it('Should succeed if correct credentials', (done) => {
      request(app)
        .post('/api/auth/retrieve-token')
        .send({ ...user.data })
        .end((err, res) => {
          authData = res.body.data;
          predict.response(res, 'tokenIssuedSuccessfully', 0, 200);
          done();
        });
    });

  });

  describe('POST /api/auth/refresh-token', () => {

    it('Should fail if missing refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .end((err, res) => {
          predict.response(res, 'missingRequiredParameters', 1, 422);
          predict.failedParameters(res, {
            refreshToken: 'missingValue'
          });
          done();
        });
    });

    it('Should succeed if correct refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: authData.refreshToken })
        .end((err, res) => {
          //authData = res.body.data;
          predict.response(res, 'tokenIssuedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with invalid refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: authData.refreshToken, fingerprint: authData.fingerprint })
        .end((err, res) => {
          predict.response(res, 'resourceNotFound', 1, 404);
          done();
        });
    });

  });


  describe('POST /api/auth/provide-email', () => {

    it('Should fail if missing email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({})
        .end((err, res) => {
          predict.response(res, 'missingRequiredParameters', 1, 422);
          predict.failedParameters(res, {
            email: 'missingValue'
          });
          done();
        });
    });

    it('Should fail if invalid email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({ email: 'foo' })
        .end((err, res) => {
          predict.response(res, 'malformedRequest', 1, 422);
          predict.failedParameters(res, {
            email: 'emailIsInvalid'
          });
          done();
        });
    });

    it('Should succeed with registered email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({ email: user.data.email })
        .end((err, res) => {
          predict.response(res, 'info.pleaseUsePasswordToEnter', 0, 200);
          user.remove()
            .then(() => {
              done()
            });
        });
    });

    it('Should succeed with unregistered email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({ email: user.data.email })
        .end((err, res) => {
          predict.response(res, 'info.pleaseCheckEmailToEnter', 0, 200);
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
