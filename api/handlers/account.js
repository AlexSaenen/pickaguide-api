'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const visitorHandler = require('./visitor').Visitor;
const profileHandler = require('./profile').Profile;
const jwt = require('jsonwebtoken');
const config = require('config');

class Account extends Handler {
    static signup(reqBody) {
        return new Promise((resolve, reject) => {
            const failed = this.assertInput(['pseudo', 'password', 'passwordConfirmation', 'email'], reqBody);

            if (failed) { reject(`We need your ${failed}`); } else {
                const emailRegex = /.+@.+/i;
                const email = reqBody.email;

                if (!emailRegex.test(email)) {
                    reject(`${email} is not a valid email address`);
                } else {
                    const pseudo = reqBody.pseudo;
                    const password = reqBody.password;
                    const passwordConfirmation = reqBody.passwordConfirmation;

                    if (typeof pseudo !== 'string' || pseudo.length > 50 || pseudo.length === 0) {
                        reject('Invalid pseudo');
                    } else if (typeof password !== 'string' || password.length > 50 || password.length === 0) {
                        reject('Invalid password');
                    } else if (password !== passwordConfirmation) {
                        reject('Passwords do not match');
                    } else {
                        this.findByPseudo({ pseudo })
                        .then((account) => {
                            if (account) { reject(`An account with ${pseudo} already exists`); }
                        })
                        .then(() => {
                            return profileHandler.add({ email });
                        })
                        .catch((err) => {
                            if (err.indexOf('E11000') !== -1) { err = 'This email already exists'; }
                            reject(err);
                        })
                        .then((profile) => {
                            return visitorHandler.add({ profile: profile._id });
                        })
                        .then((visitor) => {
                            const newAccount = new db.Accounts({ pseudo, password, visitor: visitor._id });
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

    static disableByPseudo(reqBody) {
        return new Promise((resolve, reject) => {
            const failed = this.assertInput(['pseudo'], reqBody);

            if (failed) { reject(`We need your ${failed}`); } else {
                db.Accounts
                .findOneAndUpdate({ pseudo: reqBody.pseudo }, { accountStatus: 'disabled' }, (err) => {
                    if (err) { throw err.message; } else {
                        resolve('Account disabled');
                    }
                });
            }
        });
    }

    static removeByPseudo(reqBody) {
        return new Promise((resolve, reject) => {
            const failed = this.assertInput(['pseudo'], reqBody);

            if (failed) { reject(`We need your ${failed}`); } else {
                db.Accounts
                .findOne({ pseudo: reqBody.pseudo })
                .exec((err, account) => {
                    if (err) { throw err.message; } else if (account == null) {
                        throw new Error(`Account with pseudo ${reqBody.pseudo} does not exist`);
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

    static findByPseudo(reqBody) {
        return new Promise((resolve, reject) => {
            const failed = this.assertInput(['pseudo'], reqBody);

            if (failed) { reject(`We need your ${failed}`); } else {
                db.Accounts
                .findOne({ pseudo: reqBody.pseudo })
                .lean()
                .exec((err, account) => {
                    if (err) { throw err.message; } else {
                        resolve(account);
                    }
                });
            }
        });
    }

    static findAll() {
      return new Promise((resolve) => {
        db.Accounts
          .find()
          .exec((err, accounts) => {
            if (err) { throw err.message; } else {
              resolve(accounts);
            }
          })
      });
    }

    static authenticate(pseudo, password) {
      return new Promise((resolve, reject) => {
        this.findByPseudo({"pseudo": pseudo})
          .then((result) => {
            if (result.password != password) {
              reject('Invalid password');
            } else {
              var token = jwt.sign({ foo: 'bar' }, config.jwtSecret);
              resolve({"token": token});
            }
          })
          .catch((err) => {
            reject(err);
          });
      })
    }
}

exports.Account = Account;
