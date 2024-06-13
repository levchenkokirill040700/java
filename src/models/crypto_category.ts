import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    full: {
        type: String,
        required: true,
        unique: false
    }
});

const CryptoCategoryModel = mongoose.model('crypto_category', CategorySchema);

export = CryptoCategoryModel;
