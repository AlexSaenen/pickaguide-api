const db = require('../database');
const _ = require('lodash');
const displayName = require('./profile').displayName;


const capitalize = (advert) => {
  const fieldsToCapitalize = ['title'];

  fieldsToCapitalize.forEach((fieldName) => {
    const fieldValue = advert[fieldName];
    if (fieldValue && fieldValue.constructor === String) {
      advert[fieldName] = advert[fieldName].capitalize();
    }
  });
};

const add = (creator, fields) => {
  return new Promise((resolve, reject) => {
    fields.owner = creator;

    const newAd = new db.Adverts(fields);
    capitalize(newAd);

    newAd.save((err) => {
      if (err) {
        let message;
        if (err.code === 11000) { message = 'This advert already exists'; } else { message = 'Invalid data'; }
        return reject({ code: 1, message });
      }

      resolve({ code: 0, message: 'Advert created' });
    });
  });
};

const remove = (userId, advertId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findOne({ _id: advertId, owner: userId }, 'owner active')
      .exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }

        advert.remove((removeErr) => {
          if (removeErr) { return reject({ code: 3, message: removeErr.message }); }

          resolve();
        });
      });
  });
};

const find = (advertId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findById(String(advertId))
      .populate({ path: 'owner', select: 'profile.firstName profile.lastName' })
      .lean()
      .exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert == null) { return reject({ code: 2, message: 'Advert not found' }); }

        if (advert.owner) {
          advert.owner = advert.owner.profile;
          advert.owner.displayName = displayName(advert.owner);
          delete advert.owner.firstName;
          delete advert.owner.lastName;
        } else {
          advert.owner = { displayName: 'Deleted user' };
        }

        resolve({ advert });
      });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .find({ active: true })
      .populate({ path: 'owner', select: 'profile.firstName profile.lastName' })
      .lean()
      .limit(10)
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        adverts.forEach((advert) => {
          if (advert.owner) {
            advert.owner = displayName(advert.owner.profile);
          }
        });

        resolve(adverts);
      });
  });
};

const findMain = () => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .find({ active: true })
      .populate({ path: 'owner', select: 'profile.firstName profile.lastName' })
      .lean()
      .limit(10)
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        adverts.forEach((advert) => {
          if (advert.owner) {
            advert.owner = displayName(advert.owner.profile);
          }
        });

        resolve(adverts);
      });
  });
};

const findAllFrom = (userId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .find({ owner: String(userId) }, 'title description photoUrl active')
      .lean()
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(adverts);
      });
  });
};

const findAllFromHim = (userId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .find({ owner: String(userId), active: true }, 'title description photoUrl')
      .lean()
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(adverts);
      });
  });
};

const search = (regexSearch) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .find({ $or: regexSearch, active: true })
      .populate({ path: 'owner', select: 'profile.firstName profile.lastName' })
      .lean()
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        adverts.forEach((advert) => {
          if (advert.owner) {
            advert.owner = displayName(advert.owner.profile);
          }
        });

        resolve(adverts);
      });
  });
};

const update = (userId, advertId, advertBody) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findOne({ _id: advertId, owner: userId })
      .populate({ path: 'owner', select: 'profile.firstName profile.lastName' })
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

          const jsonAdvert = JSON.parse(JSON.stringify(updatedAdvert));

          if (jsonAdvert.owner) {
            jsonAdvert.owner.displayName = displayName(jsonAdvert.owner.profile);
            delete jsonAdvert.owner.profile;
          } else {
            jsonAdvert.owner = { displayName: 'Deleted user' };
          }

          resolve({ advert: jsonAdvert });
        });
      });
  });
};

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

const toggle = (userId, advertId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findOne({ _id: advertId, owner: userId }, 'owner active')
      .exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }

        advert.active = !advert.active;
        advert.save((saveErr) => {
          if (saveErr) { return reject({ code: 3, message: saveErr.message }); }

          resolve();
        });
      });
  });
};

const toggleOff = (userId, advertId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findOneAndUpdate({ _id: advertId, owner: userId }, { active: false }, (err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }

        resolve();
      });
  });
};


module.exports = { add, remove, find, findAll, findMain, findAllFrom, findAllFromHim, search, toggle, toggleOff, update };
