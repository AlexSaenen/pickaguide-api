const NodeGeocoder = require('node-geocoder');
const db = require('../database');
const _ = require('lodash');
const displayName = require('./profile').displayName;


const options = {
  provider: 'google',
  apiKey: 'AIzaSyBE5bc1-R4JKw8qENkfQQg9VBM8sZ2GMlY',
};

const geocoder = NodeGeocoder(options);

const capitalize = (advert) => {
  const fieldsToCapitalize = ['title', 'city', 'country'];

  fieldsToCapitalize.forEach((fieldName) => {
    const fieldValue = advert[fieldName];
    if (fieldValue && fieldValue.constructor === String) {
      advert[fieldName] = advert[fieldName].capitalize();
    }
  });
};

const transformAdressToCoordinates = (fields) => {
  return new Promise((resolve, reject) => {
    let address = `${fields.city}, ${fields.country}`;
    if (fields.location) {
      address = `${fields.location}, ${fields.city}, ${fields.country}`;
    }
    geocoder.geocode(address)
      .then((res) => {
        if (res.length === 0) {
          resolve('address not found');
        }
        resolve([res[0].longitude, res[0].latitude]);
      })
      .catch(err => reject(err));
  });
};

const add = (creator, fields) => {
  return new Promise((resolve, reject) => {
    fields.owner = creator;

    return transformAdressToCoordinates(fields)
    .then((coordinatesTransformed) => {
      if (coordinatesTransformed === 'address not found') {
        coordinatesTransformed = [0, 0];
      }

      fields.location = { coordinates: coordinatesTransformed };
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

const removeAll = (userId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .find({ owner: userId })
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        Promise
          .all(adverts.map(advert =>
            new Promise((resolveRemove, rejectRemove) => {
              advert.remove((removeErr) => {
                if (removeErr) { return rejectRemove({ code: 2, message: removeErr.message }); }

                resolveRemove();
              });
            })
          ))
          .then(() => resolve())
          .catch(removeAllErr => reject(removeAllErr));
      });
  });
};

const find = (advertId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findById(String(advertId), '-comments')
      .populate({ path: 'owner', select: 'profile.firstName profile.lastName' })
      .lean()
      .exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert == null) { return reject({ code: 2, message: 'Advert not found' }); }

        if (advert.owner) {
          const ownerId = advert.owner._id;
          advert.owner = advert.owner.profile;
          advert.owner._id = ownerId;
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
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        adverts.forEach((advert) => {
          if (advert.owner) {
            advert.ownerId = advert.owner._id;
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
            advert.ownerId = advert.owner._id;
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
      .find({ owner: String(userId) }, 'title description photoUrl active city country rate')
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
      .find({ owner: String(userId), active: true }, 'title description photoUrl city country rate')
      .lean()
      .exec((err, adverts) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(adverts);
      });
  });
};

const findNear = (center, maxDistance) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .find({ active: true })
      .near('location', { center, maxDistance: Number(maxDistance), spherical: true })
      .lean()
      .exec((err, adverts) => {
        if (err) { return reject({ code: 4, message: err.message }); }
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
            advert.ownerId = advert.owner._id;
            advert.owner = displayName(advert.owner.profile);
          }
        });

        resolve(adverts);
      });
  });
};

const findOwner = (advertId) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findById(String(advertId))
      .lean()
      .exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert == null) { return reject({ code: 2, message: 'Advert not found' }); }

        resolve(advert.owner);
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

const updateRate = (visitId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findById(visitId, 'about')
      .lean()
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(visit.about);
      });
  })
    .then((advertId) => {
      return new Promise((resolve, reject) => {
        db.Visits
          .find({
            about: String(advertId),
            visitorRate: {
              $ne: null,
            },
          }, 'visitorRate')
          .lean()
          .exec((err, visits) => {
            if (err) { return reject({ code: 2, message: err.message }); }

            const averageRate = visits.reduce((sum, visit) => sum + visit.visitorRate, 0) / visits.length;
            resolve(averageRate);
          });
      })
        .then((rate) => {
          return new Promise((resolve, reject) => {
            db.Adverts.findByIdAndUpdate(advertId, { rate })
              .exec((err) => {
                if (err) { return reject({ code: 3, message: err.message }); }

                resolve();
              });
          });
        });
    });
};

// const addOccupied = (userId, advertId, reqBody) => {
//   return new Promise((resolve, reject) => {
//     const occupied = reqBody.occupied;
//
//     if (occupied === undefined) { return reject({ code: 1, message: 'Need occupied' }); }
//     if (occupied.from === undefined || occupied.to === undefined) {
//       return reject({ code: 2, message: 'Occupied has to be well formatted' });
//     }
//     if (occupied.from.constructor !== Date || occupied.to.constructor !== Date) {
//       return reject({ code: 3, message: 'Occupied has to be expressed in Date' });
//     }
//
//     db.Adverts
//       .findOne({
//         owner: userId,
//         _id: advertId,
//       }, 'occupied')
//       .exec((err, advert) => {
//         if (err) { return reject({ code: 1, message: err.message }); }
//         if (advert === null) { return reject({ code: 2, message: 'Cannot find advert' }); }
//
//         advert.occupied.sort((a, b) => a.from - b.from);
//         const isNotPossible = advert.occupied.some((block) => {
//           if (block.from <= occupied.from && block.to > occupied.from) {
//             return true;
//           }
//
//           if (occupied.from <= block.from && occupied.to > block.from) {
//             return true;
//           }
//
//           return false;
//         });
//
//         if (isNotPossible) { return reject({ code: 3, message: 'Cannot fit this occupied in' }); }
//
//         advert.occupied.push(occupied);
//         advert.occupied.sort((a, b) => a.from - b.from);
//         advert.save((saveErr, updatedAdvert) => {
//           if (saveErr) { return reject({ code: 4, messages: saveErr.message }); }
//           if (updatedAdvert === null) { return reject({ code: 5, message: 'Failed to update advert' }); }
//
//           const jsonAdvert = JSON.parse(JSON.stringify(updatedAdvert));
//
//           if (jsonAdvert.owner) {
//             jsonAdvert.owner.displayName = displayName(jsonAdvert.owner.profile);
//             delete jsonAdvert.owner.profile;
//           } else {
//             jsonAdvert.owner = { displayName: 'Deleted user' };
//           }
//
//           resolve({ advert: jsonAdvert });
//         });
//       });
//   });
// };

// const removeOccupied = (userId, advertId, reqBody) => {
//   return new Promise((resolve, reject) => {
//     const occupied = reqBody.occupied;
//
//     if (occupied === undefined) { return reject({ code: 1, message: 'Need occupied' }); }
//     if (occupied.from === undefined || occupied.to === undefined) {
//       return reject({ code: 2, message: 'Occupied has to be well formatted' });
//     }
//     if (occupied.from.constructor !== Date || occupied.to.constructor !== Date) {
//       return reject({ code: 3, message: 'Occupied has to be expressed in Date' });
//     }
//
//     db.Adverts
//       .findOne({
//         owner: userId,
//         _id: advertId,
//       }, 'occupied')
//       .exec((err, advert) => {
//         if (err) { return reject({ code: 1, message: err.message }); }
//         if (advert === null) { return reject({ code: 2, message: 'Cannot find advert' }); }
//
//         const index = advert.occupied.findIndex(occupy => occupy.from === occupied.from && occupy.to === occupy.to);
//         if (index !== -1) {
//           advert.occupied.remove(index);
//           advert.save((saveErr, updatedAdvert) => {
//             if (saveErr) { return reject({ code: 4, messages: saveErr.message }); }
//             if (updatedAdvert === null) { return reject({ code: 5, message: 'Failed to update advert' }); }
//
//             const jsonAdvert = JSON.parse(JSON.stringify(updatedAdvert));
//
//             if (jsonAdvert.owner) {
//               jsonAdvert.owner.displayName = displayName(jsonAdvert.owner.profile);
//               delete jsonAdvert.owner.profile;
//             } else {
//               jsonAdvert.owner = { displayName: 'Deleted user' };
//             }
//
//             resolve({ advert: jsonAdvert });
//           });
//         }
//
//         resolve({ advert });
//       });
//   });
// };

// const getOccupied = (userId, advertId) => {
//   return new Promise((resolve, reject) => {
//     db.Adverts
//       .findOne({
//         owner: userId,
//         _id: advertId,
//       }, 'occupied')
//       .exec((err, advert) => {
//         if (err) { return reject({ code: 1, message: err.message }); }
//         if (advert === null) { return reject({ code: 2, message: 'Cannot find advert' }); }
//
//         resolve(advert.occupied);
//       });
//   });
// };

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

const toggleAllOff = (userId) => {
  return findAllFromHim(userId)
    .then(adverts =>
      Promise.all(
        adverts.map(advert => toggleOff(userId, advert._id))
      )
    );
};


module.exports = { add, remove, removeAll, findOwner, find, findAll, findMain, findAllFrom, findAllFromHim, findNear, search, toggle, toggleOff, toggleAllOff, update, updateRate };
