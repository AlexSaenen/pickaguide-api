const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const WORK_FORCE = 10;
const Schema = mongoose.Schema;

const userSchema = new Schema({
  account: {
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    emailConfirmation: { type: Boolean, default: true },
    token: { type: String, index: true },
    resetPasswordToken: { type: String, index: true },
    paymentId: { type: String, default: null },
    stripeId: { type: String, default: null},
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    birthdate: { type: Date, default: Date.now },
    gender: { type: String, default: 'm' },
    phone: { type: String, unique: true, sparse: true, index: true },

    city: { type: String },
    country: { type: String },

    description: { type: String, default: 'My personal description' },
    interests: [{ type: String }],
    _fsId: { type: Schema.Types.ObjectId, ref: 'fs.files', default: null },
  },
  location: {
    type: {
      type: String,
      enum: 'Point',
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  isGuide: { type: Boolean, default: false },
  isBlocking: { type: Boolean, default: false },
}).index({ location: '2dsphere' }, { sparse: true });


userSchema.methods.hash = function hash(plainPassword, next) {
  bcrypt.hash(plainPassword, WORK_FORCE).then((hashed) => {
    next(hashed);
  });
};

userSchema.methods.comparePassword = function comparePassword(plainPassword, next) {
  bcrypt.compare(plainPassword, this.account.password, (err, isMatch) => {
    if (err) return next(err);
    next(null, isMatch);
  });
};

exports.Users = mongoose.model('Users', userSchema);
