import mongoose from 'mongoose'


const chatUserDetailsSchema = mongoose.Schema({
    lastMessage: String,
    user: {
        userId: String,
        name: String,
        photo: String,
    }
})

const userChatSchema = mongoose.Schema({
    id: { type: String, required: true },
    updatedAt: { type: Date, required: true },
    chatIds: {
        type: mongoose.Schema.Types.Map,
        dynamic: true,
        of: chatUserDetailsSchema,
        unique:true
    }
})


export const userChatModel = mongoose.model("userChat", userChatSchema)