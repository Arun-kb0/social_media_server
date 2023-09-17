import mongoose from "mongoose";

const allUsersSchema = mongoose.Schema({
    id: { type: String, required: true , index:true},
    name: { type: String, required: true },
    email: { type: String, required: true },
    picture: String,
    provider: String,
    isOnline: { type: Boolean, default: false },
    socketId: String
})

export const allUsersModel = mongoose.model('allusers', allUsersSchema)