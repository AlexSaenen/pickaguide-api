'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../../index');
const helpers = require('../helpers');
const nock = require('nock');
const db = require('../../api/database');

describe('Public Account Routes', () => {
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
  
  describe('GET /public/accounts/', () => {
    
    it('should return accounts', (done) => {
      request(app)
        .get('/public/accounts/')
        .expect(200, done);
    });
  });
});