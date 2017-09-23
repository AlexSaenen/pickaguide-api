const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationschema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },

  forWhom: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  by: { type: Schema.Types.ObjectId, ref: 'Users', default: null },

  creationDate: { type: Date, default: Date.now },
  readAt: { type: Date, default: null },
}).index({ forWhom: 1, creationDate: 1, title: 1 }, { unique: true });

exports.Notifications = mongoose.model('Notifications', notificationschema);
