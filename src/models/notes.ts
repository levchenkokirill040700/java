import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
    created: {
        type: Date,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [String]
});

export = mongoose.model('note', NoteSchema);
