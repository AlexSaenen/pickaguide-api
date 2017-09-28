const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;

const connectionUrl = (['staging', 'production'].indexOf(process.env.NODE_ENV) !== -1 ?
  `mongodb://${config.mongo.user}:${config.mongo.password}@${config.mongo.url}?authSource=admin` :
  `mongodb://${config.mongo.url}`);

console.log(connectionUrl);

const init = () => mongoose.connect(connectionUrl, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true,
});

exports.ObjectId = mongoose.Types.ObjectId;

String.prototype.capitalize = function capitalize() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

exports.Users = require('./models/user').Users;
exports.Adverts = require('./models/advert').Adverts;
exports.Visits = require('./models/visit').Visits;
exports.Comments = require('./models/advert').Comments;
exports.Blacklists = require('./models/blacklist').Blacklists;
exports.Notifications = require('./models/notification').Notifications;

exports.conn = mongoose.connection;
exports.mongo = mongoose.mongo;
exports.init = init;
