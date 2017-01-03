'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const jwt = require('jsonwebtoken');
const config = require('config');

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

  static signup(reqBody) {
    const visitorHandler = require('./visitor').Visitor;
    const profileHandler = require('./profile').Profile;

    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['firstName', 'lastName', 'password', 'email'], reqBody);

      if (failed) { reject({ code: 400, error: `We need your ${failed}` }); } else {
        const emailRegex = /.+@.+/i;
        const email = reqBody.email;

        if (!emailRegex.test(email)) { reject({ code: 400, error: `${email} is not a valid email address` }); } else {
          const firstName = reqBody.firstName;
          const lastName = reqBody.lastName;
          const password = reqBody.password;

          let fieldFailed = null;
          const fieldsToValidate = ['firstName', 'lastName', 'password'];
          fieldsToValidate.every((fieldName) => {
            const field = reqBody[fieldName];
            if (typeof field !== 'string' || field.length > 50 || field.length === 0) { fieldFailed = fieldName; }
            return fieldFailed === null;
          });

          if (fieldFailed) { reject({ code: 400, error: `Invalid ${fieldFailed}` }); } else {
            profileHandler.add({ firstName, lastName })
              .then((profile) => {
                return visitorHandler.add({ profile: profile._id });
              })
              .then((visitor) => {
                const newAccount = new db.Accounts({ email, password, visitor: visitor._id });
                newAccount.save((err) => {
                  if (err) {
                    if (err.name === 'MongoError' && err.message.indexOf('E11000') !== -1) { err = { message: 'This email already exists' }; }
                    reject({ code: 409, error: err.message });
                  } else {
                    resolve({ message: 'Account created' });
                  }
                });
              })
              .catch((err) => {
                if (err.code === undefined) {
                  err = { code: 500, error: 'An error occurred, please try again' };
                }

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
        .then((result) => {
          if (result.password !== password) {
            reject({ code: 400, error: 'Invalid email or password' });
          } else {
            const token = jwt.sign({ userId: result._id }, config.jwtSecret);
            resolve({ token });
          }
        })
        .catch((error) => {
          reject({ code: 500, error });
        });
    });
  }
}

exports.Account = Account;
