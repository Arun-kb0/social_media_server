import mongoose from "mongoose";

const followSchema = mongoose.Schema({
    ownername: { type: String, required: true },
    id: { type: String, required: true ,index:true },
    followers: [{
        photo: String,
        name: { type: String, required: true },
        id: { type: String, required: true }
    }],
    following: [{
        photo: String,
        name: { type: String, required: true },
        id: { type: String, required: true },
        isOnline:{type:Boolean  , default: false},
    }],
})

followSchema.index({ "following.id":1})

export const followModel  = mongoose.model('follow',followSchema)