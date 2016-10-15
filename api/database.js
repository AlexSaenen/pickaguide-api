'use strict';

const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;

const init = () => {
    return new Promise((resolve) => {
        mongoose.connect(`mongo:${config.mongoPort}/pickaguideDB`);
        resolve();
    });
};

exports.ObjectId = mongoose.Types.ObjectId;

exports.Accounts = require('../models/account').Accounts;
exports.Profiles = require('../models/profile').Profiles;
exports.Visitors = require('../models/visitor').Visitors;

exports.init = init;
