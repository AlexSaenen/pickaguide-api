const db = require('../database');
const _ = require('lodash');
const displayName = require('./profile').displayName;


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
      .find({ by: String(userId) }, 'about when status hasEnded')
      .populate({ path: 'about', select: 'title photoUrl owner' })
      .lean()
      .sort('-when')
      .exec((err, visits) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        visits.forEach((visit) => {
          visit.status = visit.status[visit.status.length - 1];
        });

        resolve(visits);
      });
  });
};

const findAllFor = (userId) => {
  return new Promise((resolve, reject) => {
    db.Visits
      .find({}, 'by about when status hasEnded')
      .populate({ path: 'about', match: { owner: String(userId) }, select: 'title photoUrl owner' })
      .lean()
      .sort('-when')
      .exec((err, visits) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        visits = visits.filter(visit => visit.about !== null);
        visits.forEach((visit) => {
          visit.status = visit.status[visit.status.length - 1];
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

            visit.with = displayName(visit.by.profile);
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

const cancel = (userId, visitId, reqBody) => {
  return changeStatus({
    userId,
    visitId,
    reqBody,
    assertUserType: isFromVisitor,
    defaultReason: 'No reason',
  }, ['waiting', 'accepted'], 'cancelled');
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

// static findToReview(userId) {
//   return new Promise((resolve, reject) => {
//     db.Visits
//       .find({ by: String(userId) }, 'about when status')
//       .lean()
//       .exec((err, visits) => {
//         if (err) { return reject({ code: 1, message: err.message }); }
//
//         visits.forEach((visit) => {
//           visit.status = visit.status[visit.status.length - 1];
//         });
//
//         const ids = _.map(visits, 'about.owner');
//
//         User
//           .findInIds(ids, 'profile.firstName profile.lastName')
//           .then((users) => {
//             const userHash = _.map(users, '_id').map(String);
//
//             visits.forEach((visit) => {
//               if (visit.about) {
//                 const index = userHash.indexOf(String(visit.about.owner));
//                 visit.about.ownerName = displayName(users[index].profile);
//               }
//             });
//
//             resolve(visits);
//           })
//           .catch(findGuideErr => reject(findGuideErr));
//       });
//   });
// }

module.exports = { create, getCreator, find, findAllFrom, findAllFor, findAsGuide, findAsVisitor, cancel, deny, finish, accept };
