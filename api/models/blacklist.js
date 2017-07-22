const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const blacklistSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
});


exports.Blacklists = mongoose.model('Blacklists', blacklistSchema);
