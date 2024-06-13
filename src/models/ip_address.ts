import mongoose, { Schema } from 'mongoose';

const IPAddressSchema = new Schema({
    updated: {
        type: Date,
        required: true
    },
    ip_address: {
        type: String,
        required: true,
        unique: true
    },
    region: String,
    city: String,
    region_code: String,
    version: String,
    country_name: String,
    country_code: String,
    continent_code: String,
    latitude: Number,
    longitude: Number,
    asn: String,
    org: String
});

const IPAddressModel = mongoose.model('ipAddress', IPAddressSchema);

export = IPAddressModel;