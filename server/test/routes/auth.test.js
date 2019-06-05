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

  describe('POST /api/auth/grant-access', () => {

    it('Should fail if missing email or password', (done) => {
      request(app)
        .post('/api/auth/grant-access')
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
        .post('/api/auth/grant-access')
        .send({ email: `_${user.data.email}`, password: user.data.password })
        .end((err, res) => {
          predict.response(res, 'userDocumentNotFound', 1, 404);
          done();
        });
    });

    it('Should fail if incorrect user password', (done) => {
      request(app)
        .post('/api/auth/grant-access')
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
        .post('/api/auth/grant-access')
        .send({ ...user.data })
        .end((err, res) => {
          authData = res.body.data;
          predict.response(res, 'tokenIssuedSuccessfully', 0, 200);
          done();
        });
    });
  });
  describe('GET /api/auth/profile', () => {

    it('Should be authorized for protected page', (done) => {
      request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authData.token}`)
        .send()
        .end((err, res) => {
          predict.response(res, 'yourStoredData', 0, 200);
          done();
        });
    });

    it('Should be fail with wrong or outdated token', (done) => {
      request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authData.token}xx`)
        .send()
        .end((err, res) => {
          //authData = res.body.data;
          predict.response(res, 'youHaveNotLoggedIn', 1, 401);
          done();
        });
    });

  });
  describe('PUT /api/auth/password', () => {
    it('Should fail if missing oldPassword and newPassword', (done) => {
      request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${authData.token}`)
        .send()
        .end((err, res) => {
          predict.response(res, 'missingRequiredParameters', 1, 422);
          predict.failedParameters(res, {
            oldPassword: 'missingValue',
            newPassword: 'missingValue'
          });
          done();
        });
    });

    const newPassword = 'new1234567';

    it('Should fail if oldPassword is incorrect', (done) => {
      request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${authData.token}`)
        .send({ oldPassword: 'foo', newPassword })
        .end((err, res) => {
          predict.response(res, 'malformedRequest', 1, 422);
          predict.failedParameters(res, {
            oldPassword: 'isInvalid'
          });
          done();
        });
    });

    it('Should succeed if oldPassword is correct and new password is valid', (done) => {
      request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${authData.token}`)
        .send({ oldPassword: user.data.password, newPassword })
        .end((err, res) => {
          predict.response(res, 'savedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should fail with valid but old refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-access')
        .send({ refreshToken: authData.refreshToken })
        .end((err, res) => {
          predict.response(res, 'refreshTokenDocumentNotFound', 1, 404);
          done();
        });
    });

    it('Should succeed with new correct credentials', (done) => {
      request(app)
        .post('/api/auth/grant-access')
        .send({ ...user.data, password: newPassword })
        .end((err, res) => {
          authData = res.body.data;
          predict.response(res, 'tokenIssuedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should be authorized for protected page', (done) => {
      request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authData.token}`)
        .send()
        .end((err, res) => {
          predict.response(res, 'yourStoredData', 0, 200);
          done();
        });
    });

  });


  describe('POST /api/auth/refresh-access', () => {

    it('Should fail if missing refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-access')
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
        .post('/api/auth/refresh-access')
        .send({ refreshToken: authData.refreshToken })
        .end((err, res) => {
          //authData = res.body.data;
          predict.response(res, 'tokenIssuedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should fail with invalid refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-access')
        .send({ refreshToken: authData.refreshToken, fingerprint: authData.fingerprint })
        .end((err, res) => {
          predict.response(res, 'refreshTokenDocumentNotFound', 1, 404);
          done();
        });
    });

  });


  describe('POST /api/auth/sign', () => {

    it('Should fail if missing email', (done) => {
      request(app)
        .post('/api/auth/sign')
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
        .post('/api/auth/sign')
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
        .post('/api/auth/sign')
        .send({ email: user.data.email })
        .end((err, res) => {
          predict.response(res, 'pleaseUsePasswordToEnter', 0, 200);
          user.remove()
            .then(() => {
              done()
            });
        });
    });

    it('Should succeed with unregistered email', (done) => {
      request(app)
        .post('/api/auth/sign')
        .send({ email: user.data.email })
        .end((err, res) => {
          predict.response(res, 'pleaseCheckEmailToEnter', 0, 200);
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
