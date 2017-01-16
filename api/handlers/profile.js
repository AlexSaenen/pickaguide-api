'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const _ = require('lodash');

class Profile extends Handler {

  static update(reqBody, userId) {
    return new Promise((resolve, reject) => {
      this.find({ userId })
        .then((profile) => {
          delete reqBody.userId;
          _.each(Object.keys(reqBody), (updateKey) => {
            profile[updateKey] = reqBody[updateKey];
          });

          profile.save((err) => {
            if (err) { throw err.message; }
            resolve(profile);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // TODO: p-h: Add another filter
  static find(userId) {
    const accountHandler = require('./account').Account;
    const visitorHandler = require('./visitor').Visitor;

    return new Promise((resolve, reject) => {
      accountHandler.find({ userId })
        .then((account) => {
          visitorHandler.find({ visitorId: account.visitor })
            .then((visitor) => {
              db.Profiles
                .findById(visitor.profile, (err, profile) => {
                  if (err) { throw err.message; }
                  resolve(profile);
                });
            });
        })
        .catch((err) => {
          reject(`Failed to get profile: ${err}`);
        });
    });
  }

  static findAll() {
    return new Promise((resolve) => {
      db.Profiles
        .find()
        .exec((err, profiles) => {
          if (err) { throw err.message; }
          resolve(profiles);
        });
    });
  }
}

exports.Profile = Profile;
