'use strict';

const mongoose = require('mongoose');
const config = require('config').mongo;

mongoose.Promise = global.Promise;

const buildDbUrl = (url) => {
  return 'mongodb://' + url;
};

const init = () => {
  return new Promise((resolve) => {
    mongoose.connect(buildDbUrl(config.url));
    resolve();
  });
};

exports.ObjectId = mongoose.Types.ObjectId;

exports.Accounts = require('./models/account').Accounts;
exports.Profiles = require('./models/profile').Profiles;
exports.Visitors = require('./models/visitor').Visitors;

exports.init = init;
