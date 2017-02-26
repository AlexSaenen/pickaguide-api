'use strict';

const User = require('./user').User;
const validator = require('validator');
const emailService = require('../email-service');
const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('../database');


class Account extends User {

  static find(userId, updatable = false) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'account.email', updatable)
        .then(user => resolve(updatable ? user : user.account))
        .catch(err => reject(err));
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      super.findAll('account.email')
        .then(users => resolve(users.map(user => user.account)))
        .catch(err => reject(err));
    });
  }

  static updatePassword(userId, reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['password', 'currentPassword'], reqBody);

      if (failed) { return reject({ code: 1, message: `We need your ${failed}` }); }

      super.find(userId, 'account.password', true)
        .then((user) => {
          user.comparePassword(reqBody.currentPassword, (err, isMatch) => {
            if (err) { return reject({ code: 2, message: err.message }); }
            if (!isMatch) { return reject({ code: 3, message: 'Invalid password' }); }
            if (!validator.isLength(reqBody.password, { min: 4, max: undefined })) { return reject({ code: 3, message: 'Invalid new Password' }); }

            user.hash(reqBody.password, (hashed) => {
              user.account.password = hashed;
              user.save((saveErr, updatedUser) => {
                if (saveErr) { return reject({ code: 4, message: saveErr.message }); }

                resolve(updatedUser.account);
              });
            });
          });
        })
        .catch(err => reject(err));
    });
  }

  static updateMail(userId, reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['email'], reqBody);

      if (failed) { return reject({ code: 1, message: `We need your ${failed}` }); }

      if (!validator.isEmail(reqBody.email)) { return reject({ code: 2, message: 'Invalid email' }); }

      super.update(userId, { account: { email: reqBody.email, emailConfirmation: false } })
        .then((user) => {
          this.resendEmail(userId)
            .then(() => resolve({ account: { email: user.account.email } }))
            .catch((mailErr) => {
              if (mailErr.code === 1) { resolve({ email: user.account.email }); } else { reject(mailErr); }
            });
        })
        .catch(err => reject(err));
    });
  }

  static signup(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['firstName', 'lastName', 'password', 'email'], reqBody);

      if (failed) { return reject({ code: 1, message: `We need your ${failed}` }); }

      const account = { password: reqBody.password, email: reqBody.email };
      const profile = { firstName: reqBody.firstName, lastName: reqBody.lastName };

      if (!validator.isEmail(account.email)) { return reject({ code: 2, message: 'Invalid email' }); }
      if (!validator.isLength(account.password, { min: 4, max: undefined })) { return reject({ code: 3, message: 'Invalid Password' }); }
      if (!validator.isLength(profile.firstName, { min: 2, max: 50 })) { return reject({ code: 4, message: 'Invalid firstName' }); }
      if (!validator.isLength(profile.lastName, { min: 2, max: 50 })) { return reject({ code: 5, message: 'Invalid lastName' }); }

      super.add({ account, profile })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  static authenticate(email, password) {
    return new Promise((resolve, reject) => {
      super.findByEmail(email)
        .then((user) => {
          user.comparePassword(password, (err, isMatch) => {
            if (err) { return reject({ code: 1, message: err.message }); }
            if (!isMatch) { return reject({ code: 2, message: 'Invalid password' }); }
            if (!user.account.token) {
              user.account.token = jwt.sign({ userId: user._id }, config.jwtSecret);
              user.save((saveErr) => {
                if (saveErr) { reject({ code: 3, message: saveErr.message }); }
              });
            }
            resolve({ token: user.account.token, id: user._id });
          });
        })
        .catch(err => reject(err));
    });
  }

  static isAuthorised(req, res, next) {
    if (!req.user.userId) return res.status(401).send();

    super.find(req.user.userId, 'account.token')
      .then((user) => {
        if (`Bearer ${user.account.token}` !== req.headers.authorization) {
          return res.status(401).send({ code: 1, message: 'Bad token authentication' });
        }

        return next();
      })
      .catch((findErr) => {
        if (findErr.code === 1) return res.status(500).send();

        return res.status(401).send({ code: 1, message: 'Bad token authentication' });
      });
  }

  static verifyEmailAccount(userId) {
    return new Promise((resolve, reject) => {
      super.update(userId, { account: { emailConfirmation: true } })
        .then(() => resolve({ code: 0, message: 'Email verified' }))
        .catch(err => reject(err));
    });
  }

  static resendEmail(userId) {
    return new Promise((resolve, reject) => {
      super.find(userId)
        .then((user) => {
          emailService.sendEmailConfirmation(user)
            .then(() => resolve({ code: 0, message: 'Confirmation email has been resent' }))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static sendResetPassword(email) {
    return new Promise((resolve, reject) => {
      super.findByEmail(email)
        .then((user) => {
          user.account.resetPasswordToken = jwt.sign({ issuer: 'www.pickaguide.com' }, config.jwtSecret);
          user.save((err) => {
            if (err) {
              reject({ code: 1, message: err.message });
            } else {
              emailService.sendEmailPasswordReset(user)
                .then(() => resolve({ code: 0, message: 'Reset password email has been sent' }))
                .catch(emailErr => reject(emailErr));
            }
          });
        })
        .catch(err => reject(err));
    });
  }

  static validateToken(token) {
    return new Promise((resolve, reject) => {
      db.Users.findOne({ 'account.resetPasswordToken': token }, (err, user) => {
        if (err || user === null) {
          reject({ code: 1, message: 'Password reset token is invalid' });
        } else {
          resolve({ code: 0, message: 'Password reset token is valid' });
        }
      });
    });
  }

  static resetPassword(token, password) {
    return new Promise((resolve, reject) => {
      db.Users.findOne({ 'account.resetPasswordToken': token }, (err, user) => {
        if (err || user === null) {
          reject({ code: 1, message: 'Password reset token is invalid' });
        } else {
          if (!validator.isLength(password, { min: 4, max: undefined })) { return reject({ code: 3, message: 'Invalid new Password' }); }
          user.hash(password, (hashed) => {
            user.account.password = hashed;
            user.account.resetPasswordToken = null;
            user.save((saveErr) => {
              if (saveErr) {
                reject({ code: 2, message: saveErr.message });
              } else {
                resolve({ code: 0, message: 'Password reset token is valid' });
              }
            });
          });
        }
      });
    });
  }

  static logout(userId) {
    return new Promise((resolve, reject) => {
      super.update(userId, { account: { token: null } })
        .then(() => resolve({ code: 0, message: 'User logout' }))
        .catch(err => reject(err));
    });
  }
}

exports.Account = Account;
