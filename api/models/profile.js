const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const profileSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  birthdate: { type: Date, default: 0 },
  gender: { type: String, default: 'm' },
  phone: { type: String },

  city: { type: String },
  country: { type: String },

  description: { type: String, default: 'My personal description' },
  interests: [{ type: String }],
  photoUrl: { type: String },
});

exports.Profiles = mongoose.model('Profiles', profileSchema);
