'use strict';

const _ = require('lodash');
const advertManager = require('../managers/advert');
const uploadService = require('../upload-service');
const ObjectId = require('../database').ObjectId;


class Advert {

  static create(creator, reqBody) {
    return new Promise((resolve, reject) => {
      advertManager.add(creator, reqBody)
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
    return advertManager.find(advertId);
  }

  static findAll() {
    return advertManager.findAll();
  }

  static findMain() {
    return advertManager.findMain();
  }

  static search(terms) {
    if (!terms || terms.length === 0) { return advertManager.findAll(); }

    const regexes = terms.trim().split(' ').filter(term => term.length > 2).map(term => new RegExp(term, 'i'));
    const regexSearch = [];
    ['title', 'description'].forEach((field) => {
      const searchElement = {};
      searchElement[field] = { $in: regexes };
      regexSearch.push(searchElement);
    });

    return advertManager.search(regexSearch);
  }

  static update(userId, advertId, advertBody) {
    return advertManager.update(userId, advertId, advertBody);
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

  static upload(userId, advertId, files) {
    return new Promise((resolve, reject) => {
      Promise.all(
        files.map((file) => {
          if (file.size > uploadService.maxFileSize().size) {
            return Promise.reject({ code: 1, message: `File size exceeds ${uploadService.maxFileSize().label}` });
          }

          return uploadService.uploadImage(file.path, file.originalname, file.mimetype);
        }),
      )
      .then(values =>
        advertManager.find(advertId)
          .then(advert => advert._fsIds)
          .then(idsImages => advertManager.update(userId, advertId, { _fsIds: _.union(idsImages, values.map(ObjectId)) }))
          .then(advert => resolve(advert))
          .catch(err => reject(err))
      )
      .catch(err => reject(err));
    });
  }

  static download(advertId) {
    return new Promise((resolve, reject) => {
      advertManager.find(advertId, '_fsIds')
        .then((advert) => {
          uploadService.downloadImages(advert._fsIds)
            .then((values) => {
              resolve(values);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static deleteAvatar(userId, advertId, idImage) {
    return new Promise((resolve, reject) => {
      advertManager.find(advertId, '_fsIds owner')
        .then((advert) => {
          if (advert._fsIds.find(idImage) && advert.owner === userId) {
            uploadService.deleteImage(idImage)
              .then(() => {
                advert._fsIds.remove(idImage);
                advertManager.update(userId, advertId, { _fsIds: advert._fsIds })
                  .then(updatedAdvert => resolve(updatedAdvert))
                  .catch(err => reject(err));
              })
              .catch(err => reject(err));
          } else {
            reject({ code: 1, message: 'Operation denied' });
          }
        })
        .catch(err => reject(err));
    });
  }

}

exports.Advert = Advert;
