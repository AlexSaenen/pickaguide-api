'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const Profile = require('./profile').Profile;


class Visit extends Handler {

  static create(by, about, reqBody) {
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
  }

  static find(visitId) {
    return new Promise((resolve, reject) => {
      db.Visits
        .findById(String(visitId))
        .populate({ path: 'by', select: 'profile' })
        .populate('about')
        .lean()
        .exec((err, visit) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (visit == null) { return reject({ code: 2, message: 'Visit not found' }); }

          const by = visit.by.profile;

          by.displayName = Profile._displayName(by);
          delete by.firstName;
          delete by.lastName;

          resolve({ visit });
        });
    });
  }

  static findAllFrom(userId) {
    return new Promise((resolve, reject) => {
      db.Visits
        .find({ by: String(userId) })
        .lean()
        .exec((err, visits) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve(visits);
        });
    });
  }

  static updateStatus(visitId, label, message) {
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
  }

  static isFromVisitor(visitId, userId) {
    return new Promise((resolve, reject) => {
      db.Visits
        .findOne({ _id: visitId, by: userId }, '_id')
        .exec((err, visit) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve(visit !== null);
        });
    });
  }

  static isForGuide(visitId, userId) {
    return new Promise((resolve, reject) => {
      db.Visits
        .findOne({ _id: visitId }, 'about')
        .populate('about', 'owner')
        .exec((err, visit) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (visit === null) { return reject({ code: 2, message: 'No such visit found' }); }

          resolve(String(visit.about.owner) === userId);
        });
    });
  }

  static cancel(userId, visitId, reqBody) {
    return new Promise((resolve, reject) => {
      this.isFromVisitor(visitId, userId)
        .then((itIs) => {
          if (itIs === false) { return reject({ code: 1, message: 'You cannot cancel a visit that is not yours' }); }
          if (reqBody.reason === undefined || typeof reqBody.reason !== 'string') {
            reqBody.reason = 'No reason';
          }

          this.updateStatus(visitId, 'cancelled', reqBody.reason)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static deny(userId, visitId, reqBody) {
    return new Promise((resolve, reject) => {
      this.isForGuide(visitId, userId)
        .then((itIs) => {
          if (itIs === false) { return reject({ code: 1, message: 'You cannot deny a visit that is not for you' }); }
          if (reqBody.reason === undefined || typeof reqBody.reason !== 'string') {
            reqBody.reason = 'No reason';
          }

          this.updateStatus(visitId, 'denied', reqBody.reason)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  static finish(userId, visitId, reqBody) {
    return new Promise((resolve, reject) => {
      this.isForGuide(visitId, userId)
        .then((itIs) => {
          if (itIs === false) { return reject({ code: 1, message: 'You cannot finish a visit that is not for you' }); }
          if (reqBody.reason === undefined || typeof reqBody.reason !== 'string') {
            reqBody.reason = 'No comment';
          }

          this.updateStatus(visitId, 'finished', reqBody.reason)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

}

exports.Visit = Visit;
