'use strict';

const User = require('./user').User;

const _ = require('lodash');

class Profile extends User {

  static find(userId, updatable = false) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile', updatable)
        .then(res => resolve({ code: 0, profile: updatable ? res.user : res.user.profile }))
        .catch(err => reject(err));
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      super.findAll('profile')
        .then(res => resolve({ code: 0, profiles: res.users.map(user => user.profile) }))
        .catch(err => reject(err));
    });
  }

  static update(reqBody, userId) {
    return new Promise((resolve, reject) => {
      this.find(userId, true)
        .then((res) => {
          const user = res.user;

          _.each(Object.keys(reqBody), (updateKey) => {
            user.profile[updateKey] = reqBody[updateKey];
          });

          user.save((err) => {
            if (err) { return reject({ code: 1, message: err.message }); }

            resolve({ code: 0, profile: user.profile });
          });
        })
        .catch(err => reject(err));
    });
  }
}

exports.Profile = Profile;
