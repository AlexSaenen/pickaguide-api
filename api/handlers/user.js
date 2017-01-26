'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;

class User extends Handler {

  static add(fields) {
    return new Promise((resolve, reject) => {
      const newUser = new db.Users(fields);
      newUser.save((err) => {
        if (err) {
          let message;
          if (err.code === 11000) { message = 'This account already exists'; } else { message = 'Invalid data'; }

          return reject({ code: 1, message });
        }

        resolve({ code: 0, message: 'Account created' });
      });
    });
  }

  static find(userId, selectFields = '', updatable = false) {
    return new Promise((resolve, reject) => {
      let query = db.Users.findById(userId, selectFields);

      if (updatable === false) {
        query = query.lean();
      }

      query.exec((err, user) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (user === null) { return reject({ code: 2, message: 'No user with this id' }); }

        resolve({ code: 0, user });
      });
    });
  }

  static findAll(selectFields = '') {
    return new Promise((resolve, reject) => {
      db.Users
        .find({}, selectFields)
        .lean()
        .exec((err, users) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve({ code: 0, users });
        });
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.Users
        .findOne({ 'account.email': email })
        .exec((err, user) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (user == null) { return reject({ code: 2, message: 'No account with this email' }); }

          resolve({ code: 0, user });
        });
    });
  }

  static remove(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['email', 'password'], reqBody);

      if (failed) { return reject({ code: 1, error: `We need your ${failed}` }); }

      this.findByEmail(reqBody.email)
        .then((user) => {
          user.comparePassword(reqBody.password, (err, isMatch) => {
            if (err) { return reject({ code: 2, message: err.message }); }
            if (!isMatch) { return reject({ code: 3, message: 'Invalid password' }); }

            user.remove((removalErr) => {
              if (err) { return reject({ code: 4, message: removalErr.message }); }

              resolve({ code: 0, message: 'Account deleted' });
            });
          });
        })
        .catch(err => reject({ code: 5, message: err }));
    });
  }
}

exports.User = User;
