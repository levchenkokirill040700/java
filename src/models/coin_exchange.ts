import mongoose, { Schema } from 'mongoose';

const CoinExchangeSchema = new Schema({
    date_added: {
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    website_url: {
        type: String,
        required: true,
        unique: true
    },
    coin_gecko_id: {
        type: String
    }
});

const CoinExchangeModel = mongoose.model('coin_exchange', CoinExchangeSchema);

export = CoinExchangeModel;
