'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');

describe('Account', () => {
  let app, accounts;

  let accountWithoutEmail = {
    firstName: "test",
    lastName: "test",
    password: "test"
  };

  let accountPasswordTooShort = {
    firstName: "test",
    lastName: "test",
    password: "te",
    email: "test@test.test"
  };

  let accountValid = {
    firstName: "test",
    lastName: "test",
    password: "test",
    email: "test@test.com"
  };

  before((done) => {
    server.start((err, _app) => {
      if (err) return done(err);
      app = _app;
      accounts = require('../api/database').Accounts;

      done();
    });
  });

  after((done) => {
    accounts.findOne({email: accountValid.email}).remove().exec(() => {
      server.stop(done);
    });
  });

  describe('POST /public/signup', () => {

    it('should return error if param is missing', (done) => {
      request(app)
        .post('/public/signup')
        .send(accountWithoutEmail)
        .expect(400, {
          code: 1,
          message: 'email'
        }, done);
    });

    it('should return error if password too short', (done) => {
      request(app)
        .post('/public/signup')
        .send(accountPasswordTooShort)
        .expect(400, {
          code: 5,
          message: 'Invalid Password'
        }, done);
    });

    it('should return 201 and create an account', (done) => {
      request(app)
        .post('/public/signup')
        .send(accountValid)
        .expect(201, {
          code: 0,
          message: 'Account created'
        }, done)
    });

  });
});
