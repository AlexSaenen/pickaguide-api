'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const Profile = require('./profile').Profile;
const _ = require('lodash');


class Advert extends Handler {

  static _capitalize(advert) {
    const fieldsToCapitalize = ['title'];

    fieldsToCapitalize.forEach((fieldName) => {
      const fieldValue = advert[fieldName];
      if (fieldValue && fieldValue.constructor === String) {
        advert[fieldName] = advert[fieldName].capitalize();
      }
    });
  }

  static add(creator, fields) {
    return new Promise((resolve, reject) => {
      fields.owner = creator;

      const newAd = new db.Adverts(fields);
      Advert._capitalize(newAd);

      newAd.save((err) => {
        if (err) {
          let message;
          if (err.code === 11000) { message = 'This advert already exists'; } else { message = 'Invalid data'; }
          return reject({ code: 1, message });
        }

        resolve({ code: 0, message: 'Advert created' });
      });
    });
  }

  static create(creator, reqBody) {
    return new Promise((resolve, reject) => {
      Advert.add(creator, reqBody)
        .then(() => {
          Advert.findAllFrom(creator)
            .then(adverts => resolve({ adverts }))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static findAllFrom(userId) {
    return new Promise((resolve, reject) => {
      db.Adverts
        .find({ owner: String(userId) }, 'title description hourlyPrice photoUrl active')
        .lean()
        .exec((err, adverts) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve(adverts);
        });
    });
  }

  static find(advertId) {
    return new Promise((resolve, reject) => {
      db.Adverts
        .findById(String(advertId))
        .populate({ path: 'owner', select: 'profile' })
        .lean()
        .exec((err, advert) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (advert == null) { return reject({ code: 2, message: 'Advert not found' }); }

          advert.owner = advert.owner.profile;
          advert.owner.displayName = Profile._displayName(advert.owner);
          delete advert.owner.firstName;
          delete advert.owner.lastName;

          resolve({ advert });
        });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.Adverts
        .find({})
        .lean()
        .exec((err, adverts) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve(adverts);
        });
    });
  }

  static search(terms) {
    if (!terms || terms.length === 0) { return Advert.findAll(); }

    return new Promise((resolve, reject) => {
      const regexes = terms.split(' ').map(term => new RegExp(term, 'i'));
      const regexSearch = [];
      ['title', 'description'].forEach((field) => {
        const searchElement = {};
        searchElement[field] = { $in: regexes };
        regexSearch.push(searchElement);
      });

      db.Adverts
        .find({ $or: regexSearch, active: true })
        .lean()
        .exec((err, adverts) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve(adverts);
        });
    });
  }

  static update(userId, advertId, advertBody) {
    return new Promise((resolve, reject) => {
      db.Adverts
        .findOne({ _id: advertId, owner: userId })
        .exec((err, advert) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (advert === null) { return reject({ code: 2, message: 'Cannot find advert' }); }

          const mergedAdvert = _.merge(advert, advertBody);

          mergedAdvert.save((saveErr, updatedAdvert) => {
            if (saveErr) {
              let message;
              if (saveErr.code === 11000) { message = 'This advert already exists'; } else { message = 'Invalid update'; }
              return reject({ code: 3, message });
            }

            if (updatedAdvert === null) { return reject({ code: 4, message: 'Failed to update advert' }); }

            resolve({ advert: updatedAdvert });
          });
        });
    });
  }

  // static setAvailability(userId, advertId, advertBody) {
  //   return new Promise((resolve, reject) => {
  //     const availability = advertBody.availability;
  //
  //     if (availability === undefined) { return reject({ code: 1, message: 'Need availability' }); }
  //     if (availability.constructor !== Array) { return reject({ code: 2, message: 'Availability has to be an array' }); }
  //     if (availability.some(el => el.from === undefined || el.to === undefined)) {
  //       return reject({ code: 3, message: 'Availability has to be well formatted' });
  //     }
  //     if (availability.some(el => el.from.constructor !== Date || el.to.constructor !== Date)) {
  //       return reject({ code: 4, message: 'Availability has to be expressed in Date' });
  //     }
  //   });
  // }

  static toggle(userId, advertId) {
    return new Promise((resolve, reject) => {
      db.Adverts
        .findOne({ _id: advertId, owner: userId }, 'owner active')
        .exec((err, advert) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }

          advert.active = !advert.active;
          advert.save((saveErr) => {
            if (saveErr) { return reject({ code: 3, message: saveErr.message }); }

            Advert.findAllFrom(userId)
              .then(adverts => resolve(adverts))
              .catch(findErr => reject(findErr));
          });
        });
    });
  }

  static remove(userId, advertId) {
    return new Promise((resolve, reject) => {
      db.Adverts
        .findOne({ _id: advertId, owner: userId }, 'owner active')
        .exec((err, advert) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }

          advert.remove((removeErr) => {
            if (removeErr) { return reject({ code: 3, message: removeErr.message }); }

            Advert.findAllFrom(userId)
              .then(adverts => resolve(adverts))
              .catch(findErr => reject(findErr));
          });
        });
    });
  }

}

exports.Advert = Advert;
