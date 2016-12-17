'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');

describe('Account', () => {
  let app, accounts;

  let accountWithoutEmail = {
    firstName: "accountWithoutEmail",
    lastName: "test",
    password: "test"
  };

  let accountPasswordTooShort = {
    firstName: "accountPasswordTooShort",
    lastName: "test",
    password: "te",
    email: "test@test.com"
  };

  let accountValid = {
    firstName: "accountValid",
    lastName: "test",
    password: "test",
    email: "test@test.test"
  };

  before((done) => {
    server.start((err, _app) => {
      if (err) return done(err);
      app = _app;
      accounts = require('../api/database').Accounts;

      done();
    });
  });

  //error accountPasswordTooShort is save into the database... (must be deleted)
  after((done) => {
    accounts.findOne({email: accountValid.email}).remove().exec(() => {
      accounts.findOne({email: accountPasswordTooShort.email}).remove().exec(() => {
        server.stop(done);
      });
    });
  });

  describe('POST /public/sign-up', () => {

    it('should return error if param is missing', (done) => {
      request(app)
        .post('/public/sign-up')
        .send(accountWithoutEmail)
        .expect(400, {
          code: 1,
          message: 'email'
        }, done);
    });

    it('should return error if password too short', (done) => {
      request(app)
        .post('/public/sign-up')
        .send(accountPasswordTooShort)
        .expect(400, {
          code: 5,
          message: 'Invalid Password'
        }, done);
    });

    it('should return 201 and create an account', (done) => {
      request(app)
        .post('/public/sign-up')
        .send(accountValid)
        .expect(201, {
          code: 0,
          message: 'Account created'
        }, done)
    });

  });
});
