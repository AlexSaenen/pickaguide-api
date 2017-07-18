'use strict';

const userManager = require('../managers/user');
const visitManager = require('../managers/visit');
const advertManager = require('../managers/advert');
const emailService = require('../email-service');


class User {

  static add(fields) {
    return new Promise((resolve, reject) =>
      userManager
        .add(fields)
        .then(newUser =>
          emailService.sendEmailConfirmation(newUser)
            .then(() => resolve({ code: 0, message: 'Account created' }))
            .catch((mailErr) => {
              if (mailErr.code === 1) { resolve({ code: 0, message: 'Account created' }); } else { reject(mailErr); }
            })
        )
        .catch(addErr => reject(addErr))
    );
  }

  static find(userId, selectFields = '', updatable = false) {
    return userManager.find(userId, selectFields, updatable);
  }

  static findInIds(userIds, selectFields = '', updatable = false) {
    return userManager.findInIds(userIds, selectFields, updatable);
  }

  static findAll(selectFields = '') {
    return userManager.findAll(selectFields);
  }

  static findByEmail(email) {
    return userManager.findByEmail(email);
  }

  static findByTerms(terms) {
    return userManager.findByTerms(terms);
  }

  static update(userId, reqBody) {
    return userManager.update(userId, reqBody);
  }

  static remove(reqBody) {
    return userManager.remove(reqBody);
  }

  static isGuide(userId) {
    return userManager.isGuide(userId);
  }

  static isBlocking(userId) {
    return userManager.isBlocking(userId);
  }

  static becomeGuide(userId) {
    return userManager.becomeGuide(userId);
  }

  static retire(userId) {
    return new Promise((resolve, reject) =>
      visitManager
        .findAllFor(userId)
        .then(visits =>
          Promise.all(
            visits
              .filter(visit => visit.hasEnded === false)
              .map(visit =>
                new Promise((resolveDeny, rejectDeny) => {
                  visitManager.deny(userId, visit._id, { reason: 'Guide retired' })
                  .then(() => resolveDeny())
                  .catch((err) => {
                    if (err.code === 1 && err.message === 'You cannot change the visit in this current state') {
                      return resolveDeny();
                    }

                    return rejectDeny(err);
                  });
                })
            )
          )
        )
        .then(() => advertManager.findAllFromHim(userId))
        .then(adverts =>
          Promise.all(
            adverts.map(advert => advertManager.toggleOff(userId, advert._id))
          )
        )
        .then(() =>
          userManager
            .findByIdAndUpdate(userId, { isGuide: false })
            .then(user => resolve({ id: userId, isGuide: user.isGuide }))
            .catch(updateErr => reject(updateErr))
        )
        .catch(err => reject(err))
    );
  }

  static findNear(geo, distance) {
    return userManager.findNear(geo, distance);
  }

}

exports.User = User;
