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
  photoUrl: { type: String, default: 'https://www.soundstream.tv/assets/default_profile-e08597880fc222202f22984a4f1966a29b108e856a3fb935072bfbbc302a4b73.png' },
});

exports.Profiles = mongoose.model('Profiles', profileSchema);
