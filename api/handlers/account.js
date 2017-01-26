'use strict';

const User = require('./user').User;
const validator = require('validator');

class Account extends User {

  static find(userId, updatable = false) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'account', updatable)
        .then(res => resolve({ code: 0, account: updatable ? res.user : res.user.account }))
        .catch(err => reject(err));
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      super.findAll('account')
        .then(res => resolve({ code: 0, accounts: res.users.map(user => user.account) }))
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
        .then((res) => {
          res.user.comparePassword(password, (err, isMatch) => {
            if (err) { return reject({ code: 1, message: err.message }); }
            if (!isMatch) { return reject({ code: 2, message: 'Invalid password' }); }

            resolve({ code: 0, token: res.user.account.token });
          });
        })
        .catch(err => reject(err));
    });
  }

  static isAuthorise(req, res, next) {
    if (!req.user.userId) return res.status(401).send();

    super.find(req.user.userId)
      .then((userRes) => {
        if (`Bearer ${userRes.user.account.token}` !== req.headers.authorization) {
          return res.status(401).send({ code: 1, message: 'Bad token authentication' });
        }

        return next();
      })
      .catch((err) => {
        if (err.code === 1) return res.status(500).send();
        return res.status(401).send({ code: 1, message: 'Bad token authentication' });
      });
  }
}

exports.Account = Account;
