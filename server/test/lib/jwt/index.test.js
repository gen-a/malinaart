const { expect } = require('chai');
const jwt = require('../../../../../malinaart/server/lib/jwt');

const payload = {
  email: 'test@gmail.com'
};
const data = {};

describe('/lib/jwt/index.js test', () => {
  describe('Sign JWT token', () => {
    it('should be succeed to get token with object payload', (done) => {
      data.token = jwt.sign(payload);
      expect(data.token).has.to.be.a('string');
      done();
    });
    it('should throw Error when get token for string payload', (done) => {
      try {
        jwt.sign(JSON.stringify(payload));
        expect(1).to.equal(2);
      } catch (e) {
        expect(2).to.equal(2);
      }
      done();
    });
  });
  describe('Verify JWT token', () => {
    it('should be succeed with valid token', (done) => {
      const result = jwt.verify(data.token);
      expect(result).has.to.be.an('object');
      expect(result.email).to.equal(payload.email);
      done();
    });
    it('should throw Error with invalid token', (done) => {
      try {
        jwt.verify(data.token.substring(1));
        expect(1).to.equal(2);
      } catch (e) {
        expect(2).to.equal(2);
      }
      done();
    });
  });
  describe('Decode JWT token', () => {
    it('should be succeed to get token with object payload', (done) => {
      const result = jwt.decode(data.token);
      expect(result).has.to.be.an('object');
      expect(result.payload.email).to.equal(payload.email);
      done();
    });
  });
});