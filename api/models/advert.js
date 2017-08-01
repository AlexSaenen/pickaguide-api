const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
  date: { type: Date, default: Date.now },
  post: { type: String, required: true },
  like: { type: Number, default: 0 },
});

const advertSchema = new Schema({
  title: { type: String, required: true, index: true, unique: true, sparse: true },
  description: { type: String, required: true },
  // availability: [{ from: { type: Date, required: true }, to: { type: Date, required: true } }],

  _fsId: { type: Schema.Types.ObjectId, ref: 'fs.files', default: null },
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
  active: { type: Boolean, default: false },
  comments: [commentSchema],
});


exports.Adverts = mongoose.model('Adverts', advertSchema);
exports.Comments = mongoose.model('Comments', commentSchema);
