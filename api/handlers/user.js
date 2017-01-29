'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const jwt = require('jsonwebtoken');
const config = require('config');
const emailService = require('../email-service');


class User extends Handler {

  static add(fields) {
    return new Promise((resolve, reject) => {
      const newUser = new db.Users(fields);
      newUser.hash(fields.account.password, (hashed) => {
        newUser.account.token = jwt.sign({ userId: newUser._id }, config.jwtSecret);
        newUser.account.password = hashed;

        newUser.save((err) => {
          if (err) {
            let message;
            if (err.code === 11000) { message = 'This account already exists'; } else { message = 'Invalid data'; }
            return reject({ code: 1, message });
          }
          emailService.sendEmailConfirmation(newUser)
            .then(result => resolve({ code: 0, message: 'Account created' }))
            .catch(err => reject(err));
        });
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

        resolve(user);
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

          resolve(users);
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

          resolve(user);
        });
    });
  }

  static update(reqBody, userId) {
    return new Promise((resolve, reject) => {
      db.Users
        .findByIdAndUpdate(userId, reqBody)
        .exec((err) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve({ code: 0, message: 'User information updated' });
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
