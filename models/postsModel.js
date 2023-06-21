import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    creator_id: { type: String, required: true },
    creator_name: String,
    tags: [String],
    selectedFile: String,
    createdAt: { type: Date, default: new Date() }
})

export const postModel = mongoose.model("Posts", postSchema)