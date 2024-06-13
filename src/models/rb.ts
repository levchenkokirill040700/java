import mongoose, { Schema } from 'mongoose';

const RootBeerSchema =  new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: String,
        required: true,
        index: true
    },
    image: String,
    write_up: String
});

const RBModel = mongoose.model('rb', RootBeerSchema); 

export = RBModel;
