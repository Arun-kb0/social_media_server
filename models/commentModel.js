import mongoose, { mongo } from "mongoose";

const commentSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    comments: [{
        username: { type: String, required: true },
        userId: { type: String, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: new Date() }
    }]
})

export const commentModel = mongoose.model('Comments', commentSchema)