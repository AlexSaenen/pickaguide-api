const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const visitorSchema = new Schema({
    profile: { type: Schema.ObjectId, ref: 'Profiles', required: true },
    // history: { type: Schema.ObjectId, ref: 'Histories' },
    // travelLog: { type: Schema.ObjectId, ref: 'TravelLogs' },
});

visitorSchema.post('remove', (visitor) => {
    const profiles = mongoose.model('Profiles');
    profiles.findOne({ _id: visitor.profile }, (err, profile) => {
        if (profile == null) {
            throw new Error(`Profile ${visitor.profile} does not exist`);
        }

        profile.remove();
    });
});

exports.Visitors = mongoose.model('Visitors', visitorSchema);
