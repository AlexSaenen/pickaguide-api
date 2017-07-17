'use strict';

const User = require('./user').User;
const uploadService = require('../upload-service');
const ObjectId = require('../database').ObjectId;
const displayName = require('./shared').displayName;
const _ = require('lodash');


class Profile extends User {

  static find(userId, updatable = false) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile', updatable)
        .then((user) => {
          user.profile.hasAvatar = user.profile._fsId !== null;

          if (updatable === false) {
            delete user.profile._fsId;
          }

          resolve(updatable ? user : user.profile);
        })
        .catch(err => reject(err));
    });
  }

  static findPublic(userId) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile', false)
        .then((user) => {
          Profile._formatProfile(user.profile);
          delete user.profile.phone;
          resolve(user.profile);
        })
        .catch(err => reject(err));
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const fields = {
        account: 0,
        'profile.gender': 0,
        'profile.phone': 0,
        'profile.interests': 0,
      };

      super.findAll(fields)
        .then((users) => {
          const displayableProfiles = users.map((user) => {
            Profile._formatProfile(user.profile);
            return user.profile;
          });

          resolve({ profiles: displayableProfiles, ids: users.map(user => user._id) });
        })
        .catch(err => reject(err));
    });
  }

  static search(searchTerms) {
    return new Promise((resolve, reject) => {
      super.findByTerms(searchTerms)
        .then((users) => {
          const displayableProfiles = users.map((user) => {
            const profile = user.profile;
            const names = { first: profile.firstName, last: profile.lastName };
            Profile._formatProfile(user.profile);
            profile.displayName = `${names.first} ${names.last.charAt(0)}.`;
            return profile;
          });

          resolve({ profiles: displayableProfiles, ids: users.map(user => user._id) });
        })
        .catch(err => reject(err));
    });
  }

  static hasAvatar(userId) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile._fsId')
        .then(user => resolve({ id: userId, hasAvatar: user.profile._fsId !== null }))
        .catch(err => reject(err));
    });
  }

  static upload(userId, file) {
    return new Promise((resolve, reject) => {
      uploadService.uploadImage(file.path, file.originalname, file.mimetype)
        .then((value) => {
          super.update(userId, { profile: { _fsId: new ObjectId(value) } })
            .then(() => resolve())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static download(userId) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile')
        .then((user) => {
          uploadService.downloadImage(user.profile._fsId)
            .then((value) => {
              resolve(value);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static deleteAvatar(userId) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile')
        .then((user) => {
          uploadService.deleteImage(user.profile._fsId)
            .then(() => {
              User.update(userId, { profile: { _fsId: null } })
                .then(() => resolve())
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static addGeo(userId, reqBody) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile')
        .then((user) => {
          const array = [];
          user.profile.geo =
          User.update(userId, { profile: { geo: _.concat(array, reqBody.x, reqBody.y) } })
            .then(updatedUser => resolve({ id: userId, geo: updatedUser.profile.geo }))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static findNear(userId, distance) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'profile')
        .then((user) => {
          if (!user.profile.geo) { return reject({ code: 3, message: 'User does not have localisation' }); }
          super.findNear(user.profile.geo, distance)
            .then(users => resolve(users))
            .catch(err => reject(err));
        });
    });
  }

  static _formatProfile(profile) {
    profile.displayName = displayName(profile);
    delete profile.firstName;
    delete profile.lastName;
    const ageDate = new Date(Date.now() - new Date(profile.birthdate).getTime());
    profile.age = Math.abs(ageDate.getUTCFullYear() - 1970);
    delete profile.birthdate;
    profile.hasAvatar = profile._fsId !== null;
    delete profile._fsId;
  }

}

exports.Profile = Profile;
