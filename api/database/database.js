'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const init = () => {
    return new Promise((resolve) => {
        mongoose.connect('mongodb://localhost/myapp');
        resolve();
    });
};

exports.ObjectId = mongoose.Types.ObjectId;

exports.Accounts = require('../models/account').Accounts;
exports.Profiles = require('../models/profile').Profiles;
exports.Visitors = require('../models/visitor').Visitors;

exports.init = init;
