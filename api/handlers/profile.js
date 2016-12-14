'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;

class Profile extends Handler {
  static add(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['email'], reqBody);

      if (failed) { reject(`We need your ${failed}`); } else {
        const newProfile = new db.Profiles(reqBody);
        newProfile.save((err, profile) => {
          if (err) { reject(err.message); } else {
            resolve(profile);
          }
        });
      }
    });
  }

  // TODO: p-h: Add another filter
  static find(reqHeaders) {
    return new Promise((resolve, reject) => {
      // TODO: Alex: Get email from token
      db.Profiles
        .findOne({ email: reqBody.email })
        .exec((err, account) => {
          if (err) { throw err.message; } else {
            resolve(account);
          }
        });
    });
  }

  static findAll() {
    return new Promise((resolve) => {
      db.Profiles
        .find()
        .exec((err, profiles) => {
          if (err) { throw err.message; } else {
            resolve(profiles);
          }
        });
    });
  }
}

exports.Profile = Profile;
