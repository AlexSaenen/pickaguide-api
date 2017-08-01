'use strict';

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

  static hasCover(advertId) {
    return new Promise((resolve, reject) => {
      advertManager.find(advertId)
        .then(advert => resolve({ id: advertId, hasCover: advert._fsId !== null }))
        .catch(err => reject(err));
    });
  }

  static upload(advertId, userId, file) {
    return new Promise((resolve, reject) => {
      if (file.size > uploadService.maxFileSize().size) {
        return reject({ code: 1, message: `File size exceeds ${uploadService.maxFileSize().label}` });
      }

      advertManager.find(advertId)
        .then((advert) => {
          if (advert.owner !== userId) { return reject({ code: 2, message: 'This is not your advert' }); }

          return new Promise((resolveDelete, rejectDelete) => {
            if (advert._fsId) {
              uploadService.deleteImage(advert._fsId)
                .then(() => resolveDelete())
                .catch(err => rejectDelete(err));
            } else {
              resolveDelete();
            }
          });
        })
        .then(() =>
          uploadService.uploadImage(file.path, file.originalname, file.mimetype)
            .then(value =>
              advertManager.update(userId, advertId, { _fsId: new ObjectId(value) })
                .then(() => resolve())
                .catch(err => reject(err))
            )
        )
        .catch(err => reject(err));
    });
  }

  static download(advertId) {
    return new Promise((resolve, reject) => {
      advertManager.find(advertId)
        .then((advert) => {
          uploadService.downloadImage(advert._fsId)
            .then((value) => {
              resolve(value);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static downloadDefault() {
    return new Promise((resolve, reject) => {
      uploadService.findFileId('default.png', '2e22edeba8bf5260fc60e15986c3854b')
        .then(id => uploadService.downloadImage(id))
        .then(value => resolve(value))
        .catch(err => reject(err));
    });
  }

  static deleteCover(advertId, userId) {
    return new Promise((resolve, reject) => {
      advertManager.find(advertId)
        .then((advert) => {
          if (advert.owner !== userId) { return reject({ code: 1, message: 'This is not your advert' }); }

          uploadService.deleteImage(advert._fsId)
            .then(() => {
              advertManager.update(userId, advertManager, { _fsId: null })
                .then(() => resolve())
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

}

exports.Advert = Advert;
