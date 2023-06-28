import mongoose, { mongo } from "mongoose";


const likeSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: [{
        id: { type: String, required: true },
        name: { type: String, required: true }
    }]
})

export const likeModel = mongoose.model('Likes', likeSchema) 