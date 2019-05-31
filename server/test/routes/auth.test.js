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

  let ata;

  describe('POST /api/auth/login', () => {

    it('Should fail if missing email or password', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({})
        .end((err, res) => {
          predict.response(res, 'error.missingRequiredParameters', 1, 422);
          expect(res.body.data).to.have.property('failed');
          expect(res.body.data.failed).to.eql(['email', 'password']);
          done();
        });
    });

    it('Should fail if incorrect user name', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({email:`_${user.data.email}`, password:user.data.password})
        .end((err, res) => {
          predict.response(res, 'error.incorrectUserName', 1, 422);
          done();
        });
    });

    it('Should fail if incorrect user password', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({email:user.data.email, password:`_${user.data.password}`})
        .end((err, res) => {
          predict.response(res, 'error.incorrectPassword', 1, 422);
          done();
        });
    });

    it('Should succeed if correct credentials', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({...user.data})
        .end((err, res) => {
            ata = res.body.data;
            predict.response(res, 'info.loggedInSuccessfully', 0, 200);
          done();
        });
    });

  });

  describe('POST /api/auth/refresh-token', () => {

    it('Should fail if missing token', (done) => {
      request(app)
        .post('/api/auth/refresh-token')
        .send({refreshToken:ata.refreshToken})
        .end((err, res) => {
          predict.response(res, 'error.missingRequiredParameters', 1, 422);
          expect(res.body.data).to.have.property('failed');
          expect(res.body.data.failed).to.eql(['token']);
          done();
        });
    });

    it('Should fail if missing refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-token')
        .send({token:ata.token})
        .end((err, res) => {
          predict.response(res, 'error.missingRequiredParameters', 1, 422);
          expect(res.body.data).to.have.property('failed');
          expect(res.body.data.failed).to.eql(['refreshToken']);
          done();
        });
    });

    it('Should succeed if correct token and refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-token')
        .send({token:ata.token, refreshToken:ata.refreshToken})
        .end((err, res) => {
          predict.response(res, 'info.tokenRefreshedSuccessfully', 0, 200);
          done();
        });
    });

    it('Should failed with invalid refreshToken', (done) => {
      request(app)
        .post('/api/auth/refresh-token')
        .send({token:ata.token, refreshToken:ata.refreshToken})
        .end((err, res) => {
          predict.response(res, 'error.resourceNotFoundError', 1, 404);
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
          predict.response(res, 'error.missingRequiredParameters', 1, 422);
          expect(res.body.data).to.have.property('failed');
          expect(res.body.data.failed).to.eql(['email']);
          done();
        });
    });

    it('Should fail if invalid email', (done) => {
      request(app)
        .post('/api/auth/provide-email')
        .send({ email: 'foo' })
        .end((err, res) => {
          predict.response(res, 'error.validationError', 1, 422);
          expect(res.body.data).to.have.property('email');
          expect(res.body.data.email).to.equal('error.emailIsInvalid' );
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
