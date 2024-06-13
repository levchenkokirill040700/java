import mongoose, { Schema } from 'mongoose';

const CoinSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    coin_id: {
        type: String,
        required: true,
        unique: true
    },
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    categories: {
        type: [String],
        unique: false
    }
});

const CoinModel = mongoose.model('coin', CoinSchema);

export = CoinModel;
