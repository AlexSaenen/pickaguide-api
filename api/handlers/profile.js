'use strict';

const User = require('./user').User;


class Profile extends User {

  static find(userId, updatable = false) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile', updatable)
        .then(user => resolve(updatable ? user : user.profile))
        .catch(err => reject(err));
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      super.findAll('profile')
        .then(users => resolve(users.map(user => user.profile)))
        .catch(err => reject(err));
    });
  }
}

exports.Profile = Profile;
