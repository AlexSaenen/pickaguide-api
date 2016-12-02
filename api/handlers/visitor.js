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
}

exports.Visitor = Visitor;
