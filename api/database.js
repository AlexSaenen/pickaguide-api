const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;

const init = () => mongoose.connect(config.mongo.url);

exports.ObjectId = mongoose.Types.ObjectId;

exports.Users = require('./models/user').Users;

exports.init = init;
