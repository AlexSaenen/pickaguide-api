const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const profileSchema = new Schema({
    email: { type: String, required: true },
    firstName: { type: String, default: 'John' },
    lastName: { type: String, default: 'Doe' },

    birthdate: { type: Date, default: 0 },
    gender: { type: String, default: 'm' },
    phone: { type: String },

    city: { type: String },
    country: { type: String },

    description: { type: String, default: 'My personal description' },
    interests: [{ type: String }],
    photoUrl: { type: String },
}).index({
    email: 1,
}, {
    unique: true,
});

exports.Profiles = mongoose.model('Profiles', profileSchema);
