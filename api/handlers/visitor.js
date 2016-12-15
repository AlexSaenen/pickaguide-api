'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;

class Visitor extends Handler {
  static add(reqBody) {
    return new Promise((resolve, reject) => {
      const failed = this.assertInput(['profile'], reqBody);

      if (failed) { reject(`We need your ${failed}`); } else {
        const newVisitor = new db.Visitors(reqBody);
        newVisitor.save((err, profile) => {
          if (err) { reject(err.message); } else {
            resolve(profile);
          }
        });
      }
    });
  }

  static find(reqBody) {
    return new Promise((resolve) => {
      db.Visitors
        .findById(reqBody.visitorId)
        .exec((err, visitor) => {
          if (err) { throw err.message; } else if (visitor == null) {
            throw new Error('No visitor with this id');
          } else {
            resolve(visitor);
          }
        });
    });
  }
}

exports.Visitor = Visitor;
