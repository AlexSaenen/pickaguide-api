const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const accountSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },

  isGuide: { type: Boolean, default: false },
  guide: { type: Schema.ObjectId, ref: 'Guides' },
  visitor: { type: Schema.ObjectId, ref: 'Visitors', required: true },
  accountStatus: { type: String, default: 'active' },

  isConnected: { type: Boolean, default: false },
  guid: { type: String },

  languageCode: { type: Number, default: 0 },
}).index({
  email: 1,
}, {
  unique: true,
});

accountSchema.post('remove', (account) => {
  const visitors = mongoose.model('Visitors');
  visitors.findOne({ _id: account.visitor }, (err, visitor) => {
    if (visitor == null) {
      throw new Error(`Visitor ${account.visitor} does not exist`);
    }

    visitor.remove();
  });
});

exports.Accounts = mongoose.model('Accounts', accountSchema);
