'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const jwt = require('jsonwebtoken');
const config = require('config');
const validator = require('validator');

class Account extends Handler {
  static findAll() {
    return new Promise((resolve, reject) => {
      db.Accounts
        .find()
        .exec((err, accounts) => {
          if (err) { reject(err.message); } else { resolve(accounts); }
        });
    });
  }

  static find(reqBody) {
    return new Promise((resolve, reject) => {
      db.Accounts
        .findById(String(reqBody.userId))
        .exec((err, account) => {
          if (err) {
            reject(err.message);
          } else if (account == null) {
            reject('No account with this id');
          } else {
            resolve(account);
          }
        });
    });
  }

  static findByEmail(reqBody) {
    return new Promise((resolve, reject) => {
      db.Accounts
        .findOne({ email: reqBody.email })
        .exec((err, account) => {
          if (err) {
            reject(err.message);
          } else if (account == null) {
            reject('No account with this email');
          } else {
            resolve(account);
          }
        });
    });
  }

  static  signup(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['firstName', 'lastName', 'password', 'email'], reqBody);
      if (failed) {
        reject({
          code: 1,
          message: failed
        });
      }

      const firstName = reqBody.firstName;
      const lastName = reqBody.lastName;
      const password = reqBody.password;
      const email = reqBody.email;

      if (!validator.isEmail(email)) {
        reject({
          code: 2,
          message: 'Invalid email'
        });
      } else if(!validator.isLength(firstName, {min:2, max: 50})) {
        reject({
          code: 3,
          message: 'Invalid firstName'
        });
      } else if(!validator.isLength(lastName, {min:2, max: 50})) {
        reject({
          code: 4,
          message: 'Invalid lastName'
        });
      } else if(!validator.isLength(password, {min:4, max: undefined})) {
        reject({
          code: 5,
          message: 'Invalid Password'
        });
      } else {
        const newAccount = new db.Accounts({firstName, lastName, password, email});
        newAccount.save((err) => {
          if (err) {
            let message;
            if (err.code === 11000) { message = 'This email already exists'; } else { message = 'Invalid data'; }
            reject({
              code: 6,
              message: message
            });
          } else {
            resolve({
              code: 0,
              message: 'Account created'
            });
          }
        });
      }
    });
  }

  // TODO: Alex: When logout is coded, make a call to logout when disabling or removing the account
  static disable(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['email', 'password'], reqBody);

      if (failed) { reject({ code: 400, error: `We need your ${failed}` }); } else {
        db.Accounts
          .findOneAndUpdate({ email: reqBody.email, password: reqBody.password }, { accountStatus: 'disabled' }, (err) => {
            if (err) { reject(err.message); } else { resolve({ message: 'Account disabled' }); }
          });
      }
    });
  }

  static remove(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['email', 'password'], reqBody);

      if (failed) { reject({ code: 400, error: `We need your ${failed}` }); } else {
        db.Accounts
          .findOne({ email: reqBody.email, password: reqBody.password })
          .exec((err, account) => {
            if (err) {
              reject(err.message);
            } else if (account == null) {
              reject('Wrong email or password');
            } else {
              account.remove((removalErr) => {
                if (err) { reject(removalErr.message); } else { resolve({ message: 'Account deleted' }); }
              });
            }
          });
      }
    });
  }

  static authenticate(email, password) {
    return new Promise((resolve, reject) => {
      this.findByEmail({ email })
        .then((account) => {
          account.comparePassword(password, function (err, isMatch) {
            if (err) { throw err; }
            if (!isMatch) {
              reject({
                code: 1,
                message: 'Invalid password'
              });
            } else {
              const token = jwt.sign({ userId: account._id }, config.jwtSecret);
              resolve({ token });
            }
          });
        })
        .catch((err) => {
          reject({
            code: 2,
            message: err
          });
        });
    });
  }

  static isAuthorise(req, res, next) {
    if (!req.user.userId) return res.status(401).send();
    db.Accounts.findById(String(req.user.userId), function (err, account) {

      if (err) return res.status(500).send();
      if(!account || ('Bearer ' + account.token) !== req.headers.authorization) {
        return res.status(401).send({
          code: 3,
          message: 'Bad token authentication',
        });
      }
      return next();
    });
  };
}

exports.Account = Account;
