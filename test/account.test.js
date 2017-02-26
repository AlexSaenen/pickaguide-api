'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');
const helpers = require('./helpers');
const nock = require('nock');
const db = require('../api/database');

describe('Private Account Routes', () => {
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
  
  describe('GET /accounts/:id', () => {
  
    it('should return 401 if token is not valid', (done) => {
      request(app)
        .get('/accounts/1234')
        .set('Content-Type', 'application/json')
        .expect(401, {
          code: 1,
          message: 'No authorization token was found'
        }, done);
    });
    
    it('should return 401 if token not found', (done) => {
      request(app)
        .get('/accounts/1234')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1OGIzMjk0Y2ZmOGY3ODI5YjM3NTE5NjEiLCJpYXQiOjE0ODgxMzY1MjR9.MWmIUDuQIRHXgMJ1wv38C-2hCXpccGGCNqXK49SGKzw')
        .expect(401, {
          code: 1,
          message: 'Bad token authentication'
        }, done);
    });
    
    it('should return 404 if id is not found', (done) => {
      request(app)
        .get('/accounts/1234')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(404, done);
    });
    
    it('should return 200 and an account', (done) => {
      request(app)
        .get('/accounts/' + user._id)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body.email).to.equal('test@test.test');
          done();
        });
    });
    
  });

  describe('GET /accounts/:id/resend-email', () => {

    it('should return error if email fail to send', (done) => {
      let body;
      let emailSent = nock('https://api.mailgun.net/v3/mg.pickaguide.fr')
        .post(/messages/, function (b) {
          body = b;
          return true;
        })
        .reply(200, {status: 'sent'});

      request(app)
        .get('/accounts/' + user._id + '/resend-email')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(body.from).to.be.eql('equipe@pickaguide.fr');
          expect(body.to).to.be.eql('test@test.test');
          expect(res.body.code).to.be.equal(0);
          expect(res.body.message).to.be.eql('Confirmation email has been resent');
          expect(emailSent.isDone()).to.be.true;
          done();
        });
    });

  });

  describe('PUT /accounts/logout', () => {

    it('should logout a user deleting his token', (done) => {

      request(app)
        .put('/accounts/logout')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + user.account.token)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body.code).to.be.equal(0);
          expect(res.body.message).to.be.eql('User logout');

          db.Users.findById(user._id, (err, user) => {
            if (err) return done(err);
            expect(user.account.token).to.be.null;
            done();
          });
        });

    });

  });

});
