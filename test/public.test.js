// 'use strict';
//
// const request = require('supertest');
//
// const expect = require('chai').expect;
// const server = require('../index');
//
// describe('Public Routes', () => {
//   let app, users;
//
//   const userWithoutEmail = {
//     firstName: 'userWithoutEmail',
//     lastName: 'test',
//     password: 'test'
//   };
//
//   const userPasswordTooShort = {
//     firstName: 'userPasswordTooShort',
//     lastName: 'test',
//     password: 'te',
//     email: 'test@test.com'
//   };
//
//   const userEmailInvalid = {
//     firstName: 'userPasswordTooShort',
//     lastName: 'test',
//     password: 'test',
//     email: 'test@test'
//   };
//
//   const userValid = {
//     firstName: 'userValid',
//     lastName: 'test',
//     password: 'test',
//     email: 'test@test.test'
//   };
//
//   before((done) => {
//     server.start((err, _app) => {
//       if (err) return done(err);
//       app = _app;
//       users = require('../api/database').Users;
//
//       done();
//     });
//   });
//
//   after((done) => {
//     users.findOne({'account.email': userValid.email}).remove().exec(() => {
//         server.stop(done);
//     });
//   });
//
//   describe('POST /public/sign-up', () => {
//
//     it('should return error if param is missing', (done) => {
//       request(app)
//         .post('/public/sign-up')
//         .send(userWithoutEmail)
//         .expect(400, {
//           code: 1,
//           message: 'We need your email'
//         }, done);
//     });
//
//     it('should return error if email is invalid', (done) => {
//       request(app)
//         .post('/public/sign-up')
//         .send(userEmailInvalid)
//         .expect(400, {
//           code: 2,
//           message: 'Invalid email'
//         }, done);
//     });
//
//     it('should return error if password too short', (done) => {
//       request(app)
//         .post('/public/sign-up')
//         .send(userPasswordTooShort)
//         .expect(400, {
//           code: 3,
//           message: 'Invalid Password'
//         }, done);
//     });
//
//
//     it('should return 201 and create an user', (done) => {
//       request(app)
//         .post('/public/sign-up')
//         .send(userValid)
//         .expect(201, {
//           code: 0,
//           message: 'Account created'
//         }, done)
//     });
//
//     it('should return error if user already exist', (done) => {
//       request(app)
//         .post('/public/sign-up')
//         .send(userValid)
//         .expect(400, {
//           code: 1,
//           message: 'This account already exists'
//         }, done)
//     });
//
//   });
//
//   describe('POST /public/sign-in', () => {
//     it('should return error if email is wrong', (done) => {
//       request(app)
//         .post('/public/sign-in')
//         .send(userPasswordTooShort)
//         .expect(400, {
//           code: 2,
//           message: 'No account with this email'
//         }, done)
//     });
//
//     it('should return error if password is wrong', (done) => {
//       const singinWrongPassword = {
//         email: 'test@test.test',
//         password: 'wrong'
//       };
//
//       request(app)
//         .post('/public/sign-in')
//         .send(singinWrongPassword)
//         .expect(400, {
//           code: 2,
//           message: 'Invalid password'
//         }, done);
//     });
//
//     it('should return a token', (done) => {
//       const singinuserValid = {
//         email: userValid.email,
//         password: userValid.password
//       };
//
//       request(app)
//         .post('/public/sign-in')
//         .send(singinuserValid)
//         .expect(200, (err, res) => {
//           if (err) done(err);
//           expect(res.body).to.have.property('token');
//           expect(res.body).to.have.property('id');
//           done();
//         });
//     })
//   });
// });
