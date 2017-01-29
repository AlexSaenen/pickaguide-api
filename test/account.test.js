'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');
const helpers = require('./helpers');
const nock = require('nock');

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
  
  describe('GET /account/:id/resend-email', () => {
    
    it('should return error if email fail to send', (done) => {
      let body;
      let emailSent = nock('https://api.mailgun.net/v3/mg.pickaguide.fr')
        .post(/messages/, function (b) {
          body = b;
          return true;
        })
        .reply(200, {status: 'sent'});
  
      request(app)
        .get('/account/' + user._id + '/resend-email')
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

});
