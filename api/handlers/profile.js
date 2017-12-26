'use strict';

const User = require('./user').User;
const uploadService = require('../upload-service');
const profileManager = require('../managers/profile');
const userManager = require('../managers/user');
const ObjectId = require('../database').ObjectId;


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
          profileManager.formatProfile(user.profile);
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
            profileManager.formatProfile(user.profile);
            return user.profile;
          });

          resolve({ profiles: displayableProfiles, ids: users.map(user => user._id) });
        })
        .catch(err => reject(err));
    });
  }

  static update(userId, reqBody) {
    return new Promise((resolve, reject) => {
      super.update(userId, reqBody)
      .then((user) => {
        const objectUser = user.toObject();
        objectUser.profile.hasAvatar = (user.profile._fsId !== null);
        resolve(objectUser);
      })
      .catch(reject);
    });
  }

  static search(searchTerms) {
    return new Promise((resolve, reject) => {
      super.findByTerms(searchTerms)
        .then((users) => {
          const displayableProfiles = users.map((user) => {
            const profile = user.profile;
            const names = { first: profile.firstName, last: profile.lastName };
            profileManager.formatProfile(user.profile);
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
      if (file.size > uploadService.maxFileSize().size) {
        return reject({ code: 1, message: `File size exceeds ${uploadService.maxFileSize().label}` });
      }

      super.find(userId, 'profile._fsId')
        .then(user =>
          new Promise((resolveDelete, rejectDelete) => {
            if (user.profile._fsId) {
              uploadService.deleteImage(user.profile._fsId)
                .then(() => resolveDelete())
                .catch(err => rejectDelete(err));
            } else {
              resolveDelete();
            }
          })
        )
        .then(() =>
          uploadService.uploadImage(file.path, file.originalname, file.mimetype)
            .then(value =>
              super.update(userId, { profile: { _fsId: new ObjectId(value) } })
                .then(() => resolve())
                .catch(err => reject(err))
            )
        )
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
              userManager.update(userId, { profile: { _fsId: null } })
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
      super.find(userId, 'location', true)
        .then((user) => {
          user.location.coordinates = [reqBody.lng, reqBody.lat];
          user.save((err, updatedUser) => {
            if (err) { return reject({ code: 1, message: err.message }); }

            return resolve({ id: userId, geo: updatedUser.location.coordinates });
          });
        })
        .catch(err => reject(err));
    });
  }

  static findNear(userId, distance) {
    return new Promise((resolve, reject) => {
      super.find(userId, 'location', true)
        .then((user) => {
          if (!user.location) { return reject({ code: 3, message: 'User does not have localisation' }); }
          super.findNear(user.location.coordinates, distance)
            .then(users => resolve(users))
            .catch(findNearError => reject(findNearError));
        })
        .catch(error => reject(error));
    });
  }

}

exports.Profile = Profile;
