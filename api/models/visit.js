const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const visitSchema = new Schema({
  by: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  about: { type: Schema.Types.ObjectId, ref: 'Adverts' },
  when: { type: Date, required: true },
  creationDate: { type: Date, default: Date.now },

  numberVisitors: { type: Number, required: true },
  status: [{
    label: { type: String, default: 'waiting' },
    message: { type: String, default: 'Guide needs to respond' },
    date: { type: Date, default: Date.now },
  }],
  special: { type: String, default: null },
  guideRate: { type: Number, default: null },
  visitorRate: { type: Number, default: null },
  systemRate: { type: Number, default: null },
  hasEnded: { type: Boolean, default: false },
  _fsIds: [{ type: Schema.Types.ObjectId, ref: 'fs.files', default: null }],
}).index({ by: 1, about: 1, when: 1 }, { unique: true });

exports.Visits = mongoose.model('Visits', visitSchema);
