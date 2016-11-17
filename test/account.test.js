'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');

describe('Account', () => {
  let app;

  before((done) => {
    server.start((_app) => {
      app = _app;
      done();
    });
  });

  after((done) => {
    server.stop(done);
  });

  describe('GET /accounts', () => {

    it('return an error if no token provided', (done) => {
      request(app)
        .get('/accounts/')
        .expect(403, done);
    });

  });
});
