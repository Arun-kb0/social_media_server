import mongoose, { mongo } from "mongoose";

const chatSchema = mongoose.Schema({
    roomId: { type: String, required: true , index:true },
    messages: [{
        message: { type: String, required: true },
        authorId: { type: String, required: true },
        authorName: { type: String, required: true },
        createdAt: { type: String, required: true },
    }]
})

export const chatModel = mongoose.model("chats", chatSchema)