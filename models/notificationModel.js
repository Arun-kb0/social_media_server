import mongoose, { mongo } from "mongoose";

const notificationDataSchema = mongoose.Schema({
    actionType: { type: String, required: true },
    postId: { type: String },
    likedUserName: { type: String, required: true },
    likedUserId: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
})

const notificationSchema = mongoose.Schema({
   id:{type:String,required:true},
   notifications:[notificationDataSchema]
})


export const notificationModel = mongoose.model("notification", notificationSchema)