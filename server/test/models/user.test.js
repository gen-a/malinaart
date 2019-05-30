const { expect } = require('chai');
const User = require('../../models/user');
const { connect } = require('../../services/db');
const mongoose = require('mongoose');
const { exitIfNotTest } = require('../../lib/env-params');
const user = require('../user');

exitIfNotTest();

describe('/models/user tests: ', function() {
  /** Required timeout for executing async mongoose requests. */
  this.timeout(5000);

  /** Prepare db collection. */
  before((done) => {
    connect()
      .then((res) => User.deleteMany({}))
      .then((res) => {
        done();
      })
      .catch(console.log);
  });

  describe('Check required fields', () => {
    const newUser = new User();
    it('should be invalid if email is empty', (done) => {
      newUser.validate((err) => {

        expect(err.errors).to.have.property('password');
        expect(err.errors.password.message).to.equal('user.error.passwordIsRequired');

        expect(err.errors).to.have.property('email');
        expect(err.errors.email.message).to.equal('user.error.emailIsRequired');

        done();
      });
    });
  });

  describe('With invalid data', () => {
    it('should be failed if email is invalid', (done) => {
      const newUser = new User({ ...user.data, email: '222' });
      newUser.validate((err) => {
        expect(err.errors).to.have.property('email');
        expect(err.errors.email.reason).to.equal('user.error.emailIsInvalid');
        done();
      });
    });

    it('should be failed if password is too short', (done) => {
      const newUser = new User({ ...user.data, password: '1' });
      newUser.validate((err) => {
        expect(err.errors).to.have.property('password');
        expect(err.errors.password.message).to.equal('user.error.passwordToShort');
        done();
      });
    });

    it('should be failed if password is too long', (done) => {
      const newUser = new User({ ...user.data, password: '1111111111111111111111' });
      newUser.validate((err) => {
        expect(err.errors).to.have.property('password');
        expect(err.errors.password.message).to.equal('user.error.passwordToLong');
        done();
      });
    });

    it('should be failed if password contains space characters', (done) => {
      const newUser = new User({ ...user.data, password: '11 1111' });
      newUser.validate((err) => {
        expect(err.errors).to.have.property('password');
        expect(err.errors.password.message).to.equal('user.error.passwordNoSpaceAllowed');
        done();
      });
    });
  });

  describe('With valid data', () => {

    it('should save if valid data', (done) => {
      User.create({ ...user.data, _id: new mongoose.Types.ObjectId() })
        .then((res) => {
          expect(res.email).to.equal(user.data.email);
          done();
        })
        .catch(console.log);
    });

    it('should failed with duplicate data', (done) => {
      User.create({ ...user.data, _id: new mongoose.Types.ObjectId() })
        .then((res) => {
          expect(res.email).to.equal(user.data.email);
          done();
        })
        .catch((err) => {
          expect(err.code).to.equal(11000);
          expect(err.name).to.equal('MongoError');
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
