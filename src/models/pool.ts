import mongoose, { Schema } from 'mongoose';

const PoolSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String
    },
    user_id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [
            'loan',
            'reinvestment',
            'fiat'
        ],
        required: true
    }
});

const PoolModel = mongoose.model('pools', PoolSchema);

export = PoolModel;
