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

  describe('POST /api/auth/provide-email', () => {

    it('Should fail if missing email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({})
        .end((err, res) => {
          predict.response(res, 'auth.error.validationError', 1, 422);
          expect(res.body.data).to.have.property('email');
          expect(res.body.data.email).to.equal('auth.error.emailIsRequired');
          done();
        });
    });

    it('Should fail if invalid email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({ email: 'foo' })
        .end((err, res) => {
          predict.response(res, 'auth.error.validationError', 1, 422);
          expect(res.body.data).to.have.property('email');
          expect(res.body.data.email).to.equal('auth.error.emailIsInvalid');
          done();
        });
    });

    it('Should succeed with registered email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({ email: user.data.email })
        .end((err, res) => {
          predict.response(res, 'auth.info.pleaseUsePasswordToEnter', 0, 200);
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
          predict.response(res, 'auth.info.pleaseCheckEmailToEnter', 0, 200);
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
