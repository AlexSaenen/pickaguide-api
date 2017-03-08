'use strict';

const User = require('./user').User;
const uploadService = require('../upload-service');
const ObjectId = require('../database').ObjectId;


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
      const fields = {
        account: 0,
        'profile.gender': 0,
        'profile.phone': 0,
        'profile.interests': 0,
      };

      super.findAll(fields)
        .then((users) => {
          const displayableProfiles = users.map((user) => {
            const profile = user.profile;
            profile.displayName = `${profile.firstName} ${profile.lastName.charAt(0)}.`;
            delete profile.firstName;
            delete profile.lastName;
            const ageDate = new Date(Date.now() - new Date(profile.birthdate).getTime());
            profile.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            delete profile.birthdate;
            return profile;
          });

          resolve(displayableProfiles);
        })
        .catch(err => reject(err));
    });
  }
  
  static upload(userId, file) {
    return new Promise((resolve, reject) => {
      uploadService.uploadImage(file.path, file.originalname)
        .then((value) => {
          console.log(value);
          super.update(userId, { profile: { _fsId: new ObjectId(value) } })
            .then(() => resolve())
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }
  
}

exports.Profile = Profile;
