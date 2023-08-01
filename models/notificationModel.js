import mongoose, { mongo } from "mongoose";

const notificationDataSchema = mongoose.Schema({
    actionType: { type: String, required: true },
    postId: { type: String },
    likedUserName: { type: String, required: true },
    likedUserId: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
})


// const messageNotifications1 = mongoose.Schema({
//     id: { type: String, required: true },
//     actionType: { type: String, required: true },
//     createdAt: { type: Date, default: new Date() },
//     authorName: { type: String, required: true },
//     authorId: { type: String, required: true },
// })

const messageNotificationsSchema = mongoose.Schema({
    actionType: String,
    createdAt: { type: Date, default: new Date() },
    authorName: String,
    authorId: String,
    messageCount: Number
})



const notificationSchema = mongoose.Schema({
    id: { type: String, required: true },
    notifications: [notificationDataSchema],
    totalMessageCount: { type: Number, default: 0 },
    messageNotifications: {
        type: mongoose.Schema.Types.Map,
        dynamic: true,
        of: messageNotificationsSchema,
        unique: true
    },

})


export const notificationModel = mongoose.model("notification", notificationSchema)