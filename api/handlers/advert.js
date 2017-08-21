'use strict';

const advertManager = require('../managers/advert');


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

}

exports.Advert = Advert;
