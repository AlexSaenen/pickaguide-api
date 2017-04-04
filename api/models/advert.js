const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const advertSchema = new Schema({
  title: { type: String, required: true, index: true, unique: true, sparse: true },
  description: { type: String, required: true },
  hourlyPrice: { type: String, default: 'Pay as you like' },

  photoUrl: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
});


exports.Adverts = mongoose.model('Adverts', advertSchema);
