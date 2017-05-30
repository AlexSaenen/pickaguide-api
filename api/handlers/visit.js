'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const Profile = require('./profile').Profile;
const _ = require('lodash');


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

  static _changeStatus(input, allowedStatus, nextStatus) {
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
            this.isStatus(input.visitId, allowedStatus)
              .then((itIs) => {
                if (itIs === false) { return rejectStatus({ code: 1, message: 'You cannot change the visit in this current state' }); }

                console.log('resolveStatus');
                resolveStatus();
              })
              .catch(err => rejectStatus(err));
          }),
        ])
        .then(() => {
          this.updateStatus(input.visitId, nextStatus, input.reqBody.reason)
            .then(result => resolve(result))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
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

  static isStatus(visitId, status) {
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
  }

  static isFromVisitor(visitId, userId) {
    return new Promise((resolve, reject) => {
      db.Visits
        .findOne({ _id: visitId, by: userId }, '_id')
        .lean()
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
        .lean()
        .exec((err, visit) => {
          if (err) { return reject({ code: 1, message: err.message }); }
          if (visit === null) { return reject({ code: 2, message: 'No such visit found' }); }

          resolve(String(visit.about.owner) === userId);
        });
    });
  }

  static cancel(userId, visitId, reqBody) {
    return this._changeStatus({
      userId,
      visitId,
      reqBody,
      assertUserType: this.isFromVisitor,
      defaultReason: 'No reason',
    }, ['waiting', 'accepted'], 'cancelled');
  }

  static deny(userId, visitId, reqBody) {
    return this._changeStatus({
      userId,
      visitId,
      reqBody,
      assertUserType: this.isForGuide,
      defaultReason: 'No reason',
    }, ['waiting', 'accepted'], 'denied');
  }

  static accept(userId, visitId, reqBody) {
    return this._changeStatus({
      userId,
      visitId,
      reqBody,
      assertUserType: this.isForGuide,
      defaultReason: 'No comment',
    }, 'waiting', 'accepted');
  }

  static finish(userId, visitId, reqBody) {
    return this._changeStatus({
      userId,
      visitId,
      reqBody,
      assertUserType: this.isForGuide,
      defaultReason: 'No comment',
    }, 'accepted', 'finished');
  }

}

exports.Visit = Visit;
