'use strict';

const visitManager = require('../managers/visit');
const advertManager = require('../managers/advert');
const userManager = require('../managers/user');
const displayName = require('../managers/profile').displayName;
const _ = require('lodash');


class Visit {

  static create(by, about, reqBody) {
    return new Promise((resolve, reject) => {
      advertManager
        .find(about)
        .then((advert) => {
          if (advert.advert.owner._id === undefined) {
            return reject({ code: 1, message: 'The user has been deleted' });
          }
          if (String(advert.advert.owner._id) === by) {
            return reject({ code: 2, message: 'You cannot ask yourself for a visit' });
          }

          visitManager.create(by, about, reqBody)
            .then(result => resolve(result))
            .catch(createErr => reject(createErr));
        })
        .catch(err => reject(err));
    });
  }

  static find(visitId) {
    return visitManager.find(visitId);
  }

  static findAsGuide(visitId, userId) {
    return visitManager.findAsGuide(visitId, userId);
  }

  static findAsVisitor(visitId, userId) {
    return new Promise((resolve, reject) =>
      visitManager
        .findAsVisitor(visitId, userId)
        .then((visit) => {
          if (visit.about && visit.about.owner) {
            userManager
              .findInIds([visit.about.owner], 'profile.firstName profile.lastName profile.phone account.email')
              .then((users) => {
                visit.with = displayName(users[0].profile);
                if (visit.status[visit.status.length - 1].label === 'accepted') {
                  visit.contact = { phone: users[0].profile.phone, email: users[0].account.email };
                }

                delete visit.about.owner;

                resolve({ visit });
              })
              .catch(findGuideErr => reject(findGuideErr));
          } else {
            delete visit.about;
            visit.with = 'Unknown';
            resolve({ visit });
          }
        })
        .catch(err => reject(err))
    );
  }

  static findAllFrom(userId) {
    return new Promise((resolve, reject) =>
      visitManager
      .findAllFrom(userId)
      .then((visits) => {
        const ids = _.map(visits, 'about.owner');

        userManager
          .findInIds(ids, 'profile.firstName profile.lastName')
          .then((users) => {
            const userHash = _.map(users, '_id').map(String);

            visits.forEach((visit) => {
              if (visit.about) {
                const index = userHash.indexOf(String(visit.about.owner));
                visit.about.ownerName = displayName(users[index].profile);
              }
            });

            resolve(visits);
          })
          .catch(findGuideErr => reject(findGuideErr));
      })
      .catch(err => reject(err))
    );
  }

  static findAllFor(userId) {
    return new Promise((resolve, reject) =>
      visitManager
        .findAllFor(userId)
        .then((visits) => {
          const ids = _.map(visits, 'by');

          userManager
            .findInIds(ids, 'profile.firstName profile.lastName')
            .then((users) => {
              const userHash = _.map(users, '_id').map(String);

              visits.forEach((visit) => {
                if (visit.by) {
                  const index = userHash.indexOf(String(visit.by));
                  visit.byName = displayName(users[index].profile);
                } else {
                  visit.byName = 'Deleted user';
                }
              });

              resolve(visits);
            })
            .catch(findVisitorErr => reject(findVisitorErr));
        })
        .catch(err => reject(err))
    );
  }

  static findToReview(userId) {
    return visitManager.findToReview(userId);
  }

  static cancel(userId, visitId, reqBody) {
    return visitManager.cancel(userId, visitId, reqBody);
  }

  static deny(userId, visitId, reqBody) {
    return visitManager.deny(userId, visitId, reqBody);
  }

  static accept(userId, visitId, reqBody) {
    return visitManager.accept(userId, visitId, reqBody);
  }

  static finish(userId, visitId, reqBody) {
    return new Promise((resolve, reject) =>
      visitManager
        .finish(userId, visitId, reqBody)
        .then((result) => {
          visitManager.getCreator(visitId)
            .then(creator => userManager.setBlocking(creator, true))
            .then(() => userManager.setBlocking(userId, true))
            .then(() => resolve(result))
            .catch(blockErr => reject(blockErr));
        })
        .catch(err => reject(err))
    );
  }

}

exports.Visit = Visit;
