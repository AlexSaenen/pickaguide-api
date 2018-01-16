const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true },
  date: { type: Date, default: Date.now },
  post: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
});

const advertSchema = new Schema({
  title: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: 'Point',
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },

  _fsIds: [{ type: Schema.Types.ObjectId, ref: 'fs.files', default: null }],
  rate: { type: Number, default: null },
  photoUrl: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  active: { type: Boolean, default: false },
  comments: [commentSchema],
}).index({ location: '2dsphere' }, { sparse: true }).index({ title: 1, country: 1, city: 1, owner: 1 }, { unique: true });


exports.Adverts = mongoose.model('Adverts', advertSchema);
exports.Comments = mongoose.model('Comments', commentSchema);
