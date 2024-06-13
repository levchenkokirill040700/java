import mongoose, { Schema } from 'mongoose';

const RatingSchema = new Schema({
    rb_id: { type: String, required: true },
    created: { type: Date, default: Date.now },
    user: { type: String, required: true },
    branding: Number,
    flavor: Number,
    aroma: Number,
    after_taste: Number,
    bite: Number,
    carbonation: Number,
    sweetness: Number,
    smoothness: Number,
    total: Number,
    comment: String
});

const RatingModel = mongoose.model('rb_rating', RatingSchema);

export = RatingModel;