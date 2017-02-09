const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const WORK_FORCE = 10;
const Schema = mongoose.Schema;

const userSchema = new Schema({
  account: {
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    emailConfirmation: { type: Boolean, default: false },
    token: { type: String, index: true },
    resetPasswordToken: { type: String, index: true },
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    birthdate: { type: Date, default: Date.now() },
    gender: { type: String, default: 'm' },
    phone: { type: String, unique: true, sparse: true, index: true },

    city: { type: String },
    country: { type: String },

    description: { type: String, default: 'My personal description' },
    interests: [{ type: String }],
    photoUrl: { type: String, default: 'https://www.soundstream.tv/assets/default_profile-e08597880fc222202f22984a4f1966a29b108e856a3fb935072bfbbc302a4b73.png' },
  },
});

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
