'use strict';

const db = require('../database/database');
const Handler = require('./_handler').Handler;
const visitorHandler = require('./visitor').Visitor;
const profileHandler = require('./profile').Profile;

class Account extends Handler {
    static signup(reqBody) {
        return new Promise((resolve, reject) => {
            const requiredInput = ['pseudo', 'password', 'passwordConfirmation', 'email'];
            const failed = requiredInput.find((requirement) => {
                return Object.keys(reqBody).indexOf(requirement) === -1 || reqBody[requirement] === null;
            });

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

    static findByPseudo(reqBody) {
        return new Promise((resolve, reject) => {
            const requiredInput = ['pseudo'];
            const failed = requiredInput.find((requirement) => {
                return Object.keys(reqBody).indexOf(requirement) === -1 || reqBody[requirement] === null;
            });

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
}

exports.Account = Account;
