const db = require('../database');
const _ = require('lodash');
const displayName = require('./profile').displayName;


const update = (userId, visitId, files) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findOne({ _id: visitId, by: userId })
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (visit === null) { return reject({ code: 2, message: 'Cannot find visit' }); }

        const updatedFiles = (files.length > 0 ? files : visit._fsIds);
        visit._fsIds = updatedFiles;

        visit.save((saveErr, updatedVisit) => {
          if (saveErr) {
            return reject({ code: 3, message: saveErr.message });
          }

          if (updatedVisit === null) { return reject({ code: 4, message: 'Failed to update advert' }); }

          resolve({ visit: updatedVisit });
        });
      });
  });
};

const getUpcomingVisits = (advertId) => {
  const now = Date.now();

  return new Promise((resolve, reject) => {
    db.Visits
     .find({
       about: String(advertId),
       hasEnded: false,
       when: {
         $gt: now,
       },
     }, 'when status numberVisitors')
     .sort('when')
     .lean()
     .exec((err, visits) => {
       if (err) { return reject({ code: 1, message: err.message }); }

       const concernedVisits = visits
         .filter(visit => visit.status.slice(-1).pop().label === 'accepted')
         .map(visit => ({ when: visit.when, numberVisitors: visit.numberVisitors }));

       resolve(concernedVisits);
     });
  });
};

const isForGuide = (visitId, userId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findOne({ _id: visitId }, 'about')
      .populate('about', 'owner')
      .lean()
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (visit === null) { return reject({ code: 2, message: 'No such visit found' }); }

        resolve(visit.about ? String(visit.about.owner) === userId : false);
      });
  });
};

const isFromVisitor = (visitId, userId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findOne({ _id: visitId, by: userId }, '_id')
      .lean()
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(visit !== null);
      });
  });
};

const updateStatus = (visitId, label, message) => {
  const endStates = ['finished', 'denied', 'cancelled'];

  return new Promise((resolve, reject) => {
    db.Visits
      .findByIdAndUpdate(
        visitId,
        { $push: { status: { label, message } }, $set: { hasEnded: endStates.indexOf(label) !== -1 } },
        { new: true },
        (saveErr, updatedVisit) => {
          if (saveErr) { return reject({ code: 1, saveErr }); }
          if (updatedVisit === null) { return reject({ code: 2, message: 'Failed to update visit' }); }

          resolve({ visit: updatedVisit });
        });
  });
};

const getCreator = (visitId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findById(String(visitId), 'by')
      .lean()
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (visit == null) { return reject({ code: 2, message: 'Visit not found' }); }

        resolve(visit.by);
      });
  });
};

const getGuide = (visitId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findById(String(visitId), 'about')
      .populate({ path: 'about', select: 'owner' })
      .lean()
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (visit == null) { return reject({ code: 2, message: 'Visit not found' }); }

        resolve(visit.about.owner);
      });
  });
};

const isStatus = (visitId, status) => {
  return new Promise((resolve, reject) => {
    if (status.constructor !== Array) {
      status = [status];
    }

    db.Visits
      .findById(visitId, 'status')
      .lean()
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (visit === null) { return reject({ code: 2, message: 'No such visit found' }); }

        const visitStatus = _.map(visit.status, 'label');

        resolve(status.indexOf(visitStatus[visit.status.length - 1]) !== -1);
      });
  });
};

const countAmountForAdvert = (idAdvert) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .count({
        about: String(idAdvert),
        hasEnded: true,
        'status.label': 'finished',
      })
      .exec((err, counts) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        resolve(counts);
      });
  });
};

const changeStatus = (input, allowedStatus, nextStatus) => {
  return new Promise((resolve, reject) => {
    Promise
      .all([
        new Promise((resolveAssertUser, rejectAssertUser) => {
          input.assertUserType(input.visitId, input.userId)
            .then((itIs) => {
              if (itIs === false) { return rejectAssertUser({ code: 1, message: 'You cannot change a visit that is not yours' }); }
              if (input.reqBody.reason === undefined || typeof input.reqBody.reason !== 'string') {
                input.reqBody.reason = input.defaultReason;
              }

              resolveAssertUser();
            })
            .catch(err => rejectAssertUser(err));
        }),
        new Promise((resolveStatus, rejectStatus) => {
          isStatus(input.visitId, allowedStatus)
            .then((itIs) => {
              if (itIs === false) { return rejectStatus({ code: 1, message: 'You cannot change the visit in this current state' }); }

              resolveStatus();
            })
            .catch(err => rejectStatus(err));
        }),
      ])
      .then(() => {
        updateStatus(input.visitId, nextStatus, input.reqBody.reason)
          .then(result => resolve(result))
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

const create = (by, about, reqBody) => {
  return new Promise((resolve, reject) => {
    const newVisit = new db.Visits({
      by,
      about,
      when: reqBody.when,
      numberVisitors: reqBody.numberVisitors,
      status: [{ }],
      special: reqBody.special,
    });

    newVisit.save((err) => {
      if (err) {
        let message;
        if (err.code === 11000) { message = 'This visit already exists'; } else { message = 'Invalid data'; }
        return reject({ code: 1, message });
      }

      resolve({ code: 0, message: 'Visit requested' });
    });
  });
};

const find = (visitId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findById(String(visitId))
      .populate({ path: 'by', select: 'profile.firstName profile.lastName' })
      .populate({ path: 'about', select: 'title photoUrl' })
      .lean()
      .exec((err, visit) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (visit == null) { return reject({ code: 2, message: 'Visit not found' }); }

        visit.with = (visit.by ? displayName(visit.by.profile) : 'Deleted user');
        delete visit.by;

        resolve({ visit });
      });
  });
};

const findAllFrom = (userId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .find({ by: String(userId) })
      .populate({ path: 'about', select: 'title photoUrl owner' })
      .lean()
      .sort('-when')
      .exec((err, visits) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        visits.forEach((visit) => {
          visit.finalStatus = visit.status[visit.status.length - 1];
        });

        resolve(visits);
      });
  });
};

const findAllFor = (userId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .find({})
      .populate({ path: 'about', match: { owner: String(userId) }, select: 'title photoUrl owner' })
      .lean()
      .sort('-when')
      .exec((err, visits) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        visits = visits.filter(visit => visit.about !== null);
        visits.forEach((visit) => {
          visit.finalStatus = visit.status[visit.status.length - 1];
        });

        resolve(visits);
      });
  });
};

const findAsGuide = (visitId, userId) => {
  return new Promise((resolve, reject) => {
    isForGuide(visitId, userId)
      .then((itIs) => {
        if (itIs === false) { return reject({ code: 1, message: 'You are not the guide of this visit' }); }

        db.Visits
          .findById(String(visitId))
          .populate({ path: 'by', select: 'profile.firstName profile.lastName profile.phone account.email' })
          .populate({ path: 'about', select: 'title photoUrl' })
          .lean()
          .exec((err, visit) => {
            if (err) { return reject({ code: 1, message: err.message }); }
            if (visit == null) { return reject({ code: 2, message: 'Visit not found' }); }

            visit.with = (visit.by ? displayName(visit.by.profile) : 'Deleted user');

            if (visit.status[visit.status.length - 1].label === 'accepted') {
              visit.contact = { phone: visit.by.profile.phone, email: visit.by.account.email };
            }

            delete visit.by;

            resolve({ visit });
          });
      })
      .catch(err => reject(err));
  });
};

const findAsVisitor = (visitId, userId) => {
  return new Promise((resolve, reject) => {
    isFromVisitor(visitId, userId)
      .then((itIs) => {
        if (itIs === false) { return reject({ code: 1, message: 'This is not your visit' }); }

        db.Visits
          .findById(String(visitId))
          .populate({ path: 'about', select: 'title owner photoUrl' })
          .lean()
          .exec((err, visit) => {
            if (err) { return reject({ code: 1, message: err.message }); }
            if (visit == null) { return reject({ code: 2, message: 'Visit not found' }); }

            resolve(visit);
          });
      })
      .catch(err => reject(err));
  });
};

const findToReview = (userId, as) => {
  return new Promise((resolve, reject) => {
    const findMethod = (as === 'visitor' ? findAllFrom : findAllFor);

    findMethod(userId)
      .then((visits) => {
        const visitsEnded = visits.filter(visit => visit.hasEnded && visit[as === 'visitor' ? 'visitorRate' : 'guideRate'] === null);
        const visitsFinished = visitsEnded.filter(visit => visit.status[visit.status.length - 1].label === 'finished');

        resolve(visitsFinished);
      })
      .catch(err => reject(err));
  });
};

const cancel = (userId, visitId, reqBody) => {
  return changeStatus({
    userId,
    visitId,
    reqBody,
    assertUserType: isFromVisitor,
    defaultReason: 'No reason',
  }, ['waiting', 'accepted'], 'cancelled');
};

const cancelAll = (userId) => {
  return findAllFrom(userId)
    .then(visits =>
      Promise.all(
        visits
          .filter(visit => visit.hasEnded === false)
          .map(visit =>
            new Promise((resolveCancel, rejectCancel) => {
              cancel(userId, visit._id, { reason: 'User deleted' })
                .then(() => resolveCancel())
                .catch((err) => {
                  if (err.code === 1 && err.message === 'You cannot change the visit in this current state') {
                    return resolveCancel();
                  }

                  return rejectCancel(err);
                });
            })
        )
      )
    );
};

const deny = (userId, visitId, reqBody) => {
  return changeStatus({
    userId,
    visitId,
    reqBody,
    assertUserType: isForGuide,
    defaultReason: 'No reason',
  }, ['waiting', 'accepted'], 'denied');
};

const denyAll = (userId) => {
  return findAllFor(userId)
    .then(visits =>
      Promise.all(
        visits
          .filter(visit => visit.hasEnded === false)
          .map(visit =>
            new Promise((resolveDeny, rejectDeny) => {
              deny(userId, visit._id, { reason: 'Guide retired' })
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
    );
};

const finish = (userId, visitId, reqBody) => {
  return changeStatus({
    userId,
    visitId,
    reqBody,
    assertUserType: isForGuide,
    defaultReason: 'No comment',
  }, 'accepted', 'finished');
};

const accept = (userId, visitId, reqBody) => {
  return changeStatus({
    userId,
    visitId,
    reqBody,
    assertUserType: isForGuide,
    defaultReason: 'No comment',
  }, 'waiting', 'accepted');
};

const review = (userId, visitId, reqBody, systemRate) => {
  return new Promise((resolve, reject) => {
    if (userId === reqBody.for) { return reject({ code: 3, message: 'Cannot rate yourself' }); }

    db.Visits
      .findById(visitId, 'about by')
      .populate({ path: 'about', select: 'owner' })
      .exec((err, visit) => {
        if (String(visit.by) === reqBody.for) {
          visit.guideRate = parseInt(reqBody.rate, 10);
        } else if (visit.about === null || String(visit.about.owner) === reqBody.for) {
          visit.visitorRate = parseInt(reqBody.rate, 10);
          visit.systemRate = systemRate;
        }

        visit.save((saveErr, updatedVisit) => {
          if (saveErr) { return reject({ code: 1, saveErr }); }
          if (updatedVisit === null) { return reject({ code: 2, message: 'Failed to update visit' }); }

          resolve({ visit: updatedVisit });
        });
      });
  });
};

const findAllOf = (advertId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .find({ about: String(advertId) }, '_id by')
      .lean()
      .exec((err, visits) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(visits);
      });
  });
};


module.exports = { findAllOf, getUpcomingVisits, update, create, getCreator, getGuide, countAmountForAdvert, find, findAllFrom, findToReview, findAllFor, findAsGuide, findAsVisitor, cancel, cancelAll, deny, denyAll, finish, accept, review };
