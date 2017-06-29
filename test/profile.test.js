'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');
const helpers = require('./helpers');
const db = require('../api/database');

describe('Private Profile Routes', () => {
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

  describe('POST /profiles/avatars', () => {

    it('should return 400 if avatar body param does not exist', (done) => {
      request(app)
        .post('/profiles/avatar')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(404, done);
    });

    it('should return 400 if file upload is not an image', (done) => {
      request(app)
        .post('/profiles/avatar')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .attach('avatar', __dirname + '/helpers.js')
        .expect(400, {
          code: 1,
          message: 'The mimetype is not valid must be jpeg|jpg|png|gif'
        }, done);
    });

    it('should return 200 if the image is uploaded', (done) => {
      request(app)
        .post('/profiles/avatar')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .attach('avatar', __dirname + '/test.png')
        .expect(200, (err) => {
          if (err) done(err);

          db.Users.findById(user._id, (err, user) => {
            if (err) done(err);

            expect(user.profile._fsId).to.be.not.null;
            done();
          });
        });
    });
  });

  describe('GET /public/profiles/:id/avatar', () => {

    it('should return 404 if id not found', (done) => {
      request(app)
        .get('/public/profiles/123412341234/avatar')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(404, done);
    });

    it('should return 200 if user can get avatar', (done) => {
      request(app)
        .get('/public/profiles/' + user._id + '/avatar')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(200, done);
    });

  });

  describe('DELETE /profiles/avatars', () => {

    it('should return 200 if avatar deleted', (done) => {
      request(app)
        .delete('/profiles/avatar')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(200, done);
    });

  });

});
