'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');

describe('Public Routes', () => {
  let app, accounts;

  const accountWithoutEmail = {
    firstName: "accountWithoutEmail",
    lastName: "test",
    password: "test"
  };

  const accountPasswordTooShort = {
    firstName: "accountPasswordTooShort",
    lastName: "test",
    password: "te",
    email: "test@test.com"
  };

  const accountValid = {
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

  after((done) => {
    accounts.findOne({email: accountValid.email}).remove().exec(() => {
        server.stop(done);
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

  describe('POST /public/sign-in', () => {
    it('should return error if email is wrong', (done) => {
      request(app)
        .post('/public/sign-in')
        .send(accountPasswordTooShort)
        .expect(400, {
          code: 2,
          message: 'No account with this email'
        }, done)
    });

    it('should return error if password is wrong', (done) => {
      const singinWrongPassword = {
        email: "test@test.test",
        password: "wrong"
      };
      
      request(app)
        .post('/public/sign-in')
        .send(singinWrongPassword)
        .expect(400, {
          code: 1,
          message: "Invalid password"
        }, done);
    });

    it('should return a token', (done) => {
      const singinAccountValid = {
        email: accountValid.email,
        password: accountValid.password
      };

      request(app)
        .post('/public/sign-in')
        .send(singinAccountValid)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.have.property('token');
          done();
        });
    })
  });
});
