'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');
const helpers = require('./helpers');
const nock = require('nock');
const db = require('../api/database');

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

  describe('GET /public/accounts/', () => {

    it('should return accounts', (done) => {
      request(app)
        .get('/public/accounts/')
        .expect(200, done);
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

  describe('POST /accounts/logout', () => {

    it('should logout a user deleting his token', (done) => {

      request(app)
        .post('/accounts/logout')
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
