import mongoose from "mongoose";

const lastCommentSchema = mongoose.Schema({
    username: { type: String, required: true },
    userId: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
    _id: { type: mongoose.Schema.Types.ObjectId, required: true }
})

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    creator_id: { type: String, required: true },
    creator_name: String,
    tags: [String],
    selectedFile: String,
    like_count: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },
    // last_comment: {
    //     username: String,
    //     userId:String,
    //     comment: String
    // },
    last_comment: lastCommentSchema,
    createdAt: { type: Date, default: new Date() }
})

export const postModel = mongoose.model("Posts", postSchema)