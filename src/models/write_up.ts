import mongoose, { Schema } from 'mongoose';

const WriteUpSchema =  new Schema({
    rb_id: { type: String, required: true },
    created: { type: Date, default: Date.now },
    user: { type: String, required: true },
    write_up: { type: String, required: true}
});

const WriteUpModel = mongoose.model('rb_write_up', WriteUpSchema);

export = WriteUpModel;
