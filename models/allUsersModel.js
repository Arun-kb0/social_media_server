import mongoose from "mongoose";

const allUsersSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    picture: String,
    provider: String,
    id: { type: String, required: true },
    isOnline:{type:Boolean ,default:false }
})

export const allUsersModel = mongoose.model('allusers',allUsersSchema)