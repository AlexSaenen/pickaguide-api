const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
  date: { type: Date, default: Date.now },
  post: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
});

const advertSchema = new Schema({
  title: { type: String, required: true, index: true, unique: true, sparse: true },
  country: { type: String, required: true, index: true, sparse: true },
  city: { type: String, required: true, index: true, sparse: true },
  description: { type: String, required: true },
  // occupied: [{ from: { type: Date, required: true }, to: { type: Date, required: true } }],

  photoUrl: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
  active: { type: Boolean, default: false },
  comments: [commentSchema],
});


exports.Adverts = mongoose.model('Adverts', advertSchema);
exports.Comments = mongoose.model('Comments', commentSchema);
