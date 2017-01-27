const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const emailService = require('../email-service');

const WORK_FORCE = 10;

const Schema = mongoose.Schema;
const accountSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailConfirmation: { type: Boolean, default: false},
  token: { type: String, unique: true},
  resetPasswordToken: { type: String, unique: true}
});

accountSchema.methods.hash = function (plainPassword, next) {
  bcrypt.hash(plainPassword, WORK_FORCE).then((hash) => {
    next(hash);
  });
};


accountSchema.methods.comparePassword = function(plainPassword, next) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if (err) return next(err);
    next(null, isMatch);
  });
};

// accountSchema.post('remove', (account) => {
//   const visitors = mongoose.model('Visitors');
//   visitors.findOne({ _id: account.visitor }, (err, visitor) => {
//     if (visitor == null) {
//       throw new Error(`Visitor ${account.visitor} does not exist`);
//     }
//
//     visitor.remove();
//   });
// });

exports.Accounts = mongoose.model('Accounts', accountSchema);
