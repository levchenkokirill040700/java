import mongoose, { Schema } from 'mongoose';

const VisitSchema = new Schema({
    timestamp: {
        type: Date,
        required: true
    },
    browser: String,
    version: String,
    os: String,
    platform: String,
    source: String,
    details: [{ type: String }],
    hostname: {
        type: String,
        lowercase: true
    },
    user_agent: {
        type: String,
        lowercase: true
    },
    ip_address: String,
    base_url: {
        type: String,
        lowercase: true
    },
    path: {
        type: String,
        lowercase: true
    }
});

const VisitModel = mongoose.model('visitor', VisitSchema);

export = VisitModel;