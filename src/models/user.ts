import { Schema } from 'mongoose';
const mongoose = require('mongoose');
import passportLocalMongoose from 'passport-local-mongoose';

const UserSchema =  new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    role: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        required: true
    }
});

UserSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model('userInfo', UserSchema);

export = UserModel;
