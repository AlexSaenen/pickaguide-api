var mongoose = require('mongoose');
var config = require('config');

mongoose.Promise = global.Promise;

var init = function() { return mongoose.connect(config.mongo.url); };

exports.ObjectId = mongoose.Types.ObjectId;

exports.Users = require('./models/user').Users;

exports.init = init;
