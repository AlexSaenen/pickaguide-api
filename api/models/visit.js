const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const visitSchema = new Schema({
  by: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  about: { type: Schema.Types.ObjectId, ref: 'Adverts', required: true },
  when: { type: Date, required: true },
  creationDate: { type: Date, required: true },

  numberVisitors: { type: Number, required: true },
  status: [{
    label: { type: String, default: 'waiting' },
    message: { type: String, default: 'Guide needs to respond' },
    date: { type: Date },
  }],
  special: { type: String, default: null },
}).index({ by: 1, about: 1, when: 1 }, { unique: true });

exports.Visits = mongoose.model('Visits', visitSchema);
