'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;

class Profile extends Handler {
    static add(reqBody) {
        return new Promise((resolve, reject) => {
            const requiredInput = ['email'];
            const failed = requiredInput.find((requirement) => {
                return Object.keys(reqBody).indexOf(requirement) === -1 || reqBody[requirement] === null;
            });

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

    /*
     check error param
     add other filter
     */
    static find(reqQuery) {
      return  new Promise((resolve) => {
        db.Profiles
          .findOne({email: reqQuery.email})
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
