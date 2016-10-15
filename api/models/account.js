const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const accountSchema = new Schema({
    pseudo: { type: String, required: true },
    password: { type: String, required: true },

    isGuide: { type: Boolean, default: false },
    guide: { type: Schema.ObjectId, ref: 'Guides' },
    visitor: { type: Schema.ObjectId, ref: 'Visitors', required: true },
    accountStatus: { type: String, default: 'active' },

    isConnected: { type: Boolean, default: false },
    guid: { type: String },

    languageCode: { type: Number, default: 0 },
}).index({
    pseudo: 1,
}, {
    unique: true,
});

exports.Accounts = mongoose.model('Accounts', accountSchema);
