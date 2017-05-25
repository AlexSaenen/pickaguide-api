const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
  date: { type: Date, default: Date.now },
  message: { type: String, required: true },
  upVote: { type: Number, default: 0},
  downVote: { type: Number, default: 0}
});

const advertSchema = new Schema({
  title: { type: String, required: true, index: true, unique: true, sparse: true },
  description: { type: String, required: true },
  hourlyPrice: { type: String, default: 'Pay as you like' },

  photoUrl: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
  active: { type: Boolean, default: false },
  comments: [commentSchema]
});


exports.Adverts = mongoose.model('Adverts', advertSchema);
exports.Comments = mongoose.model('Comments', commentSchema);