'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');
const helpers = require('./helpers');

describe('Account Routes', () => {
  let app, user;

  before((done) => {
    server.start((err, _app) => {
      if (err) return done(err);
      app = _app;

      helpers.createUser(_user => {
        user = _user;
        done();
      });
    });
  });

  after((done) => {
    helpers.deleteUser(user._id, () => {
      server.stop(done);
    });
  });

  describe('GET /account/', () => {

    it('should return error if token not provided', (done) => {
      request(app)
        .get('/account/')
        .expect(401, done);
    });

    it('should return accounts', (done) => {
      request(app)
        .get('/account/')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(200, done);
    });
  });

});
