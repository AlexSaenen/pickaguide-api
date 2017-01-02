'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const jwt = require('jsonwebtoken');
const config = require('config');

class Account extends Handler {
  static findAll() {
    return new Promise((resolve) => {
      db.Accounts
        .find()
        .exec((err, accounts) => {
          if (err) { throw err.message; } else {
            resolve(accounts);
          }
        });
    });
  }

  static find(reqBody) {
    return new Promise((resolve) => {
      db.Accounts
        .findById(String(reqBody.userId))
        .exec((err, account) => {
          if (err) { throw err.message; } else if (account == null) {
            throw new Error('No account with this id');
          } else {
            resolve(account);
          }
        });
    });
  }

  static findByEmail(reqBody) {
    return new Promise((resolve) => {
      db.Accounts
        .findOne({ email: reqBody.email })
        .exec((err, account) => {
          if (err) { throw err.message; } else if (account == null) {
            throw new Error('No account with this email');
          } else {
            resolve(account);
          }
        });
    });
  }

  static signup(reqBody) {
    const visitorHandler = require('./visitor').Visitor;
    const profileHandler = require('./profile').Profile;

    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['firstName', 'lastName', 'password', 'email'], reqBody);

      if (failed) { reject(`We need your ${failed}`); } else {
        const emailRegex = /.+@.+/i;
        const email = reqBody.email;

        if (!emailRegex.test(email)) {
          reject(`${email} is not a valid email address`);
        } else {
          const firstName = reqBody.firstName;
          const lastName = reqBody.lastName;
          const password = reqBody.password;

          if (typeof firstName !== 'string' || firstName.length > 50 || firstName.length === 0) {
            reject('Invalid firstName');
          } else if (typeof lastName !== 'string' || lastName.length > 50 || lastName.length === 0) {
            reject('Invalid lastName');
          } else if (typeof password !== 'string' || password.length > 50 || password.length === 0) {
            reject('Invalid password');
          } else {
            profileHandler.add({ firstName, lastName })
              .then((profile) => {
                return visitorHandler.add({ profile: profile._id });
              })
              .then((visitor) => {
                const newAccount = new db.Accounts({ email, password, visitor: visitor._id });
                newAccount.save((err) => {
                  if (err) {
                    if (err.indexOf('E11000') !== -1) { err.message = 'This email already exists'; }
                    throw err.message;
                  } else {
                    resolve({ message: 'Account created' });
                  }
                });
              })
              .catch((err) => {
                reject(err);
              });
          }
        }
      }
    });
  }

  // TODO: Alex: When logout is coded, make a call to logout when disabling or removing the account
  static disable(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['email', 'password'], reqBody);

      if (failed) { reject(`We need your ${failed}`); } else {
        db.Accounts
          .findOneAndUpdate({ email: reqBody.email, password: reqBody.password }, { accountStatus: 'disabled' }, (err) => {
            if (err) { throw err.message; } else {
              resolve({ message: 'Account disabled' });
            }
          });
      }
    });
  }

  static remove(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['email', 'password'], reqBody);

      if (failed) { reject(`We need your ${failed}`); } else {
        db.Accounts
          .findOne({ email: reqBody.email, password: reqBody.password })
          .exec((err, account) => {
            if (err) { throw err.message; } else if (account == null) {
              throw new Error('Wrong email or password');
            } else {
              account.remove((removalErr) => {
                if (err) { throw removalErr.message; } else {
                  resolve({ message: 'Account deleted' });
                }
              });
            }
          });
      }
    });
  }

  static authenticate(email, password) {
    return new Promise((resolve, reject) => {
      this.findByEmail({ email })
        .then((result) => {
          if (result.password !== password) {
            reject('Invalid password');
          } else {
            const token = jwt.sign({ userId: result._id }, config.jwtSecret);
            resolve({ token });
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

exports.Account = Account;
