'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;


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
        .find({ owner: String(userId) }, { owner: 0 })
        .lean()
        .exec((err, adverts) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve(adverts);
        });
    });
  }

}

exports.Advert = Advert;
