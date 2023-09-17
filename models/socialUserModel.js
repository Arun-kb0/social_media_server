import mongoose from "mongoose";

const socialUserSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    picture:String,
    provider: { type: String, required: true },
    id: { type: String, required: true , index:true }
})


export const socialUserModel = mongoose.model("SocialUsers", socialUserSchema)
