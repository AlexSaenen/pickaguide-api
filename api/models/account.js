const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');

const WORK_FORCE = 10;

const Schema = mongoose.Schema;
const accountSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  token: { type: String, unique: true}
});

accountSchema.pre('save', function (next) {
  const account = this;
  bcrypt.hash(account.password, WORK_FORCE).then((hash) => {
    account.password = hash;
    account.token = jwt.sign({ userId: account._id }, config.jwtSecret);
    next();
  });
});

//post save send email

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
