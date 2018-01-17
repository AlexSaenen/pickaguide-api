'use strict';

const Promise = require('bluebird');
const visitManager = require('../managers/visit');
const advertManager = require('../managers/advert');
const userManager = require('../managers/user');
const notifManager = require('../managers/notification');
const displayName = require('../managers/profile').displayName;
const uploadService = require('../upload-service');
const _ = require('lodash');


class Visit {

  static update(userId, visitId, reqFiles = []) {
    return new Promise((resolve, reject) => {
      if (reqFiles.some(file => file.size > uploadService.maxFileSize().size)) {
        return reject({ code: 1, message: `File size exceeds ${uploadService.maxFileSize().label}` });
      }

      Promise.mapSeries(reqFiles, file => uploadService.uploadImage(file.path, file.originalname, file.mimetype))
      .then(values => visitManager.update(userId, visitId, values))
      .then(advert => resolve(advert))
      .catch(err => reject(err));
    });
  }

  static create(by, about, reqBody) {
    return new Promise((resolve, reject) => {
      advertManager
        .find(about)
        .then((result) => {
          if (result.advert.owner._id === undefined) {
            return reject({ code: 1, message: 'The user has been deleted' });
          }

          if (String(result.advert.owner._id) === by) {
            return reject({ code: 2, message: 'You cannot ask yourself for a visit' });
          }

          visitManager.create(by, about, reqBody)
            .then(visit => resolve(visit))
            .catch(createErr => reject(createErr))
            .then(() => notifManager.create(result.advert.owner._id, {
              title: 'You got a visitor !',
              body: `is asking to visit '${result.advert.title}' with you`,
            }, by));
        })
        .catch(err => reject(err));
    });
  }

  static downloadImageByHook(visitId, hook) {
    return uploadService.downloadImage(hook);
  }

  static getImageHooks(visitId) {
    return new Promise((resolve, reject) => {
      visitManager.find(visitId)
        .then(result => resolve(result.visit._fsIds))
        .catch(error => reject(error));
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
    return new Promise((resolve, reject) => {
      const results = {};

      visitManager
        .findToReview(userId, 'visitor')
        .then((visits) => {
          const ids = _.map(visits, 'about.owner');

          return userManager
            .findInIds(ids, 'profile.firstName profile.lastName')
            .then((users) => {
              const userHash = _.map(users, '_id').map(String);

              visits.forEach((visit) => {
                if (visit.about) {
                  const index = userHash.indexOf(String(visit.about.owner));

                  visit.about.ownerName = (index !== -1 ? displayName(users[index].profile) : 'User deleted');
                }
              });

              results.myVisits = visits;
              return visitManager.findToReview(userId, 'guide');
            });
        })
        .then((visits) => {
          const ids = _.map(visits, 'by');

          userManager
            .findInIds(ids, 'profile.firstName profile.lastName')
            .then((users) => {
              const userHash = _.map(users, '_id').map(String);

              visits.forEach((visit) => {
                const index = userHash.indexOf(String(visit.by));

                visit.byName = (index !== -1 ? displayName(users[index].profile) : 'User deleted');
              });

              results.theirVisits = visits;
              resolve(results);
            })
            .catch(findErr => reject(findErr));
        })
        .catch(err => reject(err));
    });
  }

  static cancel(userId, visitId, reqBody) {
    return new Promise((resolve, reject) => {
      visitManager.cancel(userId, visitId, reqBody)
        .then(result => resolve(result))
        .catch(error => reject(error))
        .then(() => visitManager.getGuide(visitId))
        .then(guide => notifManager.create(guide, {
          title: 'Your visit was cancelled',
          body: 'cancelled one of your visits',
        }, userId));
    });
  }

  static deny(userId, visitId, reqBody) {
    return new Promise((resolve, reject) => {
      visitManager.deny(userId, visitId, reqBody)
        .then(result => resolve(result))
        .catch(error => reject(error))
        .then(() => visitManager.getCreator(visitId))
        .then(creator => notifManager.create(creator, {
          title: 'Your visit was denied',
          body: 'denied guiding you in one of your visits',
        }, userId));
    });
  }

  static accept(userId, visitId, reqBody) {
    return new Promise((resolve, reject) => {
      visitManager.accept(userId, visitId, reqBody)
        .then((result) => {
          return userManager.find(result.visit.by, 'profile.phone account.email', false)
          .then((creator) => {
            result.contact = { phone: creator.profile.phone, email: creator.account.email };
            resolve(result);
          })
          .then(() => notifManager.create(result.visit.by, {
            title: 'Your visit was accepted !',
            body: 'accepted to be guide in one of your visits, you will be exploring the city soon !',
          }, userId));
        })
        .catch(error => reject(error));
    });
  }

  static finish(userId, visitId, reqBody) {
    return new Promise((resolve, reject) =>
      visitManager
        .finish(userId, visitId, reqBody)
        .then((result) => {
          visitManager.getCreator(visitId)
            .then(creator =>
              userManager.setBlocking(creator, true)
              .then(() => notifManager.create(creator, {
                title: 'Your visit finished',
                body: 'marked one of your visits as completed',
              }, userId))
            )
            .then(() => userManager.setBlocking(userId, true))
            .then(() => resolve(result))
            .catch(blockErr => reject(blockErr));
        })
        .catch(err => reject(err))
    );
  }

  static review(userId, visitId, reqBody) {
    return new Promise((resolve, reject) => {
      visitManager
        .review(userId, visitId, reqBody)
        .then(() => userManager.updateRate(userId))
        .then(() => advertManager.updateRate(visitId))
        .then(() => Visit.findToReview(userId))
        .then((results) => {
          if (results.theirVisits.length === 0 && results.myVisits.length === 0) {
            userManager
              .setBlocking(userId, false)
              .then(() => resolve(results))
              .catch(err => reject(err));
          } else {
            resolve(results);
          }
        })
        .catch(err => reject(err));
    });
  }

}

exports.Visit = Visit;
