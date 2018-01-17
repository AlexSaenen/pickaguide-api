'use strict';

const Promise = require('bluebird');
const advertManager = require('../managers/advert');
const userManager = require('../managers/user');
const visitManager = require('../managers/visit');
const uploadService = require('../upload-service');

class Advert {

  static create(creator, reqBody, reqFiles) {
    return new Promise((resolve, reject) => {
      if (reqFiles.some(file => file.size > uploadService.maxFileSize().size)) {
        return reject({ code: 1, message: `File size exceeds ${uploadService.maxFileSize().label}` });
      }

      Promise.mapSeries(reqFiles, file => uploadService.uploadImage(file.path, file.originalname, file.mimetype))
      .then(values => advertManager.add(creator, reqBody, values))
      .then(() => advertManager.findAllFrom(creator))
      .then(adverts => resolve({ adverts }))
      .catch(err => reject(err));
    });
  }

  static findAllFrom(userId) {
    return advertManager.findAllFrom(userId);
  }

  static findAllFromHim(userId) {
    return advertManager.findAllFromHim(userId);
  }

  static find(advertId) {
    return new Promise((resolve, reject) => {
      advertManager.find(advertId)
        .then((result) => {
          return visitManager.getUpcomingVisits(advertId)
            .then((visits) => {
              result.advert.upcoming = visits;
              resolve(result);
            });
        })
        .catch(reject);
    });
  }

  static downloadImage(advertId) {
    return advertManager.find(advertId)
    .then(result => uploadService.downloadImage(result.advert._fsIds[0]));
  }

  static downloadImageByHook(advertId, hook) {
    return uploadService.downloadImage(hook);
  }

  static getImageHooks(advertId) {
    return new Promise((resolve, reject) => {
      advertManager.find(advertId)
      .then(result => resolve(result.advert._fsIds))
      .catch(error => reject(error));
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      advertManager.findAll()
      .then(adverts =>
        Promise.all(
          adverts.map((advert) => {
            return visitManager.countAmountForAdvert(advert._id)
            .then((count) => {
              advert.amountVisits = count;
              return advert;
            });
          })
        )
      )
      .then(adverts => resolve(adverts))
      .catch(err => reject(err));
    });
  }

  static findMain() {
    return new Promise((resolve, reject) => {
      advertManager.findMain()
      .then(adverts =>
        Promise.all(
          adverts.map((advert) => {
            return visitManager.countAmountForAdvert(advert._id)
            .then((count) => {
              advert.amountVisits = count;
              return advert;
            });
          })
        )
      )
      .then(adverts => resolve(adverts))
      .catch(err => reject(err));
    });
  }

  static search(terms) {
    return new Promise((resolve, reject) => {
      const search = () => {
        if (!terms || terms.length === 0) { return advertManager.findAll(); }

        const regexes = terms.trim().split(' ').filter(term => term.length > 2).map(term => new RegExp(term, 'i'));
        const regexSearch = [];
        ['title', 'description', 'city', 'country'].forEach((field) => {
          const searchElement = {};
          searchElement[field] = { $in: regexes };
          regexSearch.push(searchElement);
        });

        return advertManager.search(regexSearch);
      };

      search().then(adverts =>
        Promise.all(
          adverts.map((advert) => {
            return visitManager.countAmountForAdvert(advert._id)
            .then((count) => {
              advert.amountVisits = count;
              return advert;
            });
          })
        )
      )
      .then(adverts => resolve(adverts))
      .catch(err => reject(err));
    });
  }

  static update(userId, advertId, advertBody, reqFiles = []) {
    return new Promise((resolve, reject) => {
      if (reqFiles.some(file => file.size > uploadService.maxFileSize().size)) {
        return reject({ code: 1, message: `File size exceeds ${uploadService.maxFileSize().label}` });
      }

      Promise.mapSeries(reqFiles, file => uploadService.uploadImage(file.path, file.originalname, file.mimetype))
      .then(values => advertManager.update(userId, advertId, advertBody, values))
      .then(advert => resolve(advert))
      .catch(err => reject(err));
    });
  }

  static toggle(userId, advertId) {
    return advertManager
      .toggle(userId, advertId)
      .then(() => Advert.findAllFrom(userId));
  }

  static toggleOff(userId, advertId) {
    return advertManager.toggleOff(userId, advertId);
  }

  static remove(userId, advertId) {
    return advertManager
      .remove(userId, advertId)
      .then(() => Advert.findAllFrom(userId));
  }

  static getAvailability(userId, advertId) {
    return advertManager.getAvailability(userId, advertId);
  }

  static setAvailability(userId, advertId, reqBody) {
    return advertManager.setAvailability(userId, advertId, reqBody);
  }

  static findNear(userId, distance) {
    return new Promise((resolve, reject) => {
      userManager.find(userId, 'location')
      .then(user => advertManager.findNear(user.location.coordinates, distance))
      .then(adverts => resolve(adverts))
      .catch(err => reject(err));
    });
  }

}

exports.Advert = Advert;
