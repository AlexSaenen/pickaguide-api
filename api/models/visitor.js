const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const visitorSchema = new Schema({
    profile: { type: Schema.ObjectId, ref: 'Profiles', required: true },
    // history: { type: Schema.ObjectId, ref: 'Histories' },
    // travelLog: { type: Schema.ObjectId, ref: 'TravelLogs' },
});

exports.Visitors = mongoose.model('Visitors', visitorSchema);