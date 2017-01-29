'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');
const nock = require('nock');
const db = require('../api/database');

describe('Public Routes', () => {
  let app, users, userId;

  const userWithoutEmail = {
    firstName: 'userWithoutEmail',
    lastName: 'test',
    password: 'test'
  };

  const userPasswordTooShort = {
    firstName: 'userPasswordTooShort',
    lastName: 'test',
    password: 'te',
    email: 'test@test.com'
  };

  const userEmailInvalid = {
    firstName: 'userPasswordTooShort',
    lastName: 'test',
    password: 'test',
    email: 'test@test'
  };

  const userValid = {
    firstName: 'userValid',
    lastName: 'test',
    password: 'test',
    email: 'ph.gousse@gmail.com'
  };

  before((done) => {
    server.start((err, _app) => {
      if (err) return done(err);
      app = _app;
      users = require('../api/database').Users;

      done();
    });
  });

  after((done) => {
    users.findOne({'account.email': userValid.email}).remove().exec(() => {
        server.stop(done);
    });
  });

  describe('POST /public/sign-up', () => {

    it('should return error if param is missing', (done) => {
      request(app)
        .post('/public/sign-up')
        .send(userWithoutEmail)
        .expect(400, {
          code: 1,
          message: 'We need your email'
        }, done);
    });

    it('should return error if email is invalid', (done) => {
      request(app)
        .post('/public/sign-up')
        .send(userEmailInvalid)
        .expect(400, {
          code: 2,
          message: 'Invalid email'
        }, done);
    });

    it('should return error if password too short', (done) => {
      request(app)
        .post('/public/sign-up')
        .send(userPasswordTooShort)
        .expect(400, {
          code: 3,
          message: 'Invalid Password'
        }, done);
    });


    it('should return 201 and create an user', (done) => {
      let body;
      let emailSent = nock('https://api.mailgun.net/v3/mg.pickaguide.fr')
        .post(/messages/, function (b) {
          body = b;
          return true;
        })
        .reply(200, {status: 'sent'});
      
      request(app)
        .post('/public/sign-up')
        .send(userValid)
        .expect(201, (err, res) => {
          if (err) done(err);
          expect(body.from).to.be.eql('equipe@pickaguide.fr');
          expect(body.to).to.be.eql(userValid.email);
          expect(res.body.code).to.equal(0);
          expect(res.body.message).to.eql('Account created');
          expect(emailSent.isDone()).to.be.true;
          done();
        });
    });

    it('should return error if user already exist', (done) => {
      request(app)
        .post('/public/sign-up')
        .send(userValid)
        .expect(400, {
          code: 1,
          message: 'This account already exists'
        }, done)
    });

  });

  describe('POST /public/sign-in', () => {
    it('should return error if email is wrong', (done) => {
      request(app)
        .post('/public/sign-in')
        .send(userPasswordTooShort)
        .expect(400, {
          code: 2,
          message: 'No account with this email'
        }, done)
    });

    it('should return error if password is wrong', (done) => {
      const singinWrongPassword = {
        email: userValid.email,
        password: 'wrong'
      };

      request(app)
        .post('/public/sign-in')
        .send(singinWrongPassword)
        .expect(400, {
          code: 2,
          message: 'Invalid password'
        }, done);
    });

    it('should return a token', (done) => {
      const singinuserValid = {
        email: userValid.email,
        password: userValid.password
      };

      request(app)
        .post('/public/sign-in')
        .send(singinuserValid)
        .expect(200, (err, res) => {
          if (err) done(err);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('id');
          userId = res.body.id;
          done();
        });
    })
  });
  
  describe('GET /public/verify/:id', () => {
    
    it('should return err if id invalid', (done) => {
      request(app)
        .get('/public/verify/1234')
        .expect(404, done)
    });
    
    it('should confirm the email address', (done) => {
      request(app)
        .get('/public/verify/' + userId)
        .expect(200, (err, res) => {
          expect(res.body.code).to.equal(0);
          expect(res.body.message).to.eql('Email verified');
          db.Users.findById(userId, (err, user) => {
           if (err) return done(err);
           
           expect(user.account.emailConfirmation).to.be.true;
           done();
          });
        });
    });
  });
});
