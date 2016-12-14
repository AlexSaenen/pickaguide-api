'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const visitorHandler = require('./visitor').Visitor;
const profileHandler = require('./profile').Profile;
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

  static signup(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['firstname', 'lastname', 'password', 'email'], reqBody);

      if (failed) { reject(`We need your ${failed}`); } else {
        const emailRegex = /.+@.+/i;
        const email = reqBody.email;

        if (!emailRegex.test(email)) {
          reject(`${email} is not a valid email address`);
        } else {
          const firstname = reqBody.firstname;
          const lastname = reqBody.lastname;
          const password = reqBody.password;

          if (typeof firstname !== 'string' || firstname.length > 50 || firstname.length === 0) {
            reject('Invalid firstname');
          } else if (typeof lastname !== 'string' || lastname.length > 50 || lastname.length === 0) {
            reject('Invalid lastname');
          } else if (typeof password !== 'string' || password.length > 50 || password.length === 0) {
            reject('Invalid password');
          } else {
            profileHandler.add({ email, firstname, lastname })
              .catch((err) => {
                if (err.indexOf('E11000') !== -1) { err = 'This email already exists'; }
                reject(err);
              })
              .then((profile) => {
                return visitorHandler.add({ profile: profile._id });
              })
              .then((visitor) => {
                const newAccount = new db.Accounts({ password, visitor: visitor._id });
                newAccount.save((err) => {
                  if (err) { throw err.message; } else {
                    resolve('Account created');
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
              resolve('Account disabled');
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
                  resolve('Account deleted');
                }
              });
            }
          });
      }
    });
  }

  static authenticate(email, password) {
    return new Promise((resolve, reject) => {
      this.findByPseudo({ email })
        .then((result) => {
          if (result.password !== password) {
            reject('Invalid password');
          } else {
            const token = jwt.sign({ foo: 'bar' }, config.jwtSecret);
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
