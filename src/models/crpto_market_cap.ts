import mongoose, { Schema } from 'mongoose';

const MarketCapSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    id: {
        type: String,
        required: true,
        unique: true
    },
    symbol: {
        type: String,
        required: true,
        unique: true
    },
    rank: {
        type: Number,
        required: true,
        unique: false
    }
});

const MarketCapModel = mongoose.model('market_cap_ranking', MarketCapSchema);

export = MarketCapModel;
