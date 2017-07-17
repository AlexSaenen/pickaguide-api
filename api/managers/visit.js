const db = require('../database');
const _ = require('lodash');
const userManager = require('./user');
const displayName = require('../handlers/shared').displayName;


const updateStatus = (visitId, label, message) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .findByIdAndUpdate(
        visitId,
        { $push: { status: { label, message } } },
        { new: true },
        (saveErr, updatedVisit) => {
          if (saveErr) { return reject({ code: 1, saveErr }); }
          if (updatedVisit === null) { return reject({ code: 2, message: 'Failed to update visit' }); }

          resolve({ visit: updatedVisit });
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

exports.findAllFrom = (userId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .find({ by: String(userId) }, 'about when status')
      .populate({ path: 'about', select: 'title photoUrl owner' })
      .lean()
      .sort('-when')
      .exec((err, visits) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        visits.forEach((visit) => {
          visit.status = visit.status[visit.status.length - 1];
        });

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
      });
  });
};

exports.deny = (userId, visitId, reqBody) => {
  return changeStatus({
    userId,
    visitId,
    reqBody,
    assertUserType: this.isForGuide,
    defaultReason: 'No reason',
  }, ['waiting', 'accepted'], 'denied');
};
