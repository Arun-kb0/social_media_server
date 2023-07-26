import mongoose, { isValidObjectId } from "mongoose"
import { postModel } from "../models/postsModel.js"
import { likeModel } from "../models/likeModel.js"
import { commentModel } from "../models/commentModel.js"
import { allUsersModel } from "../models/allUsersModel.js"
import { io } from "../index.js"
import { v4 as uuid } from "uuid"
import { notificationModel } from "../models/notificationModel.js"



export const sendNotification = async ({ socket, data }) => {

    const { username, postId, creatorId, type } = data
    const { userId } = socket
    console.log(data)

    try {
        const creator = await allUsersModel.findOne({ id: creatorId })
        const sendNotificationToAuther = async () => {

            const result = await notificationModel.aggregate([
                { $match: { id: creatorId } },
                { $unwind: "$notifications" },
                {
                    $match: {
                        "notifications.postId": postId,
                        "notifications.actionType": type
                    }
                },
                { $project: { _id: 0, notifications: 1 } }
            ])

            io.to(creator.socketId).emit("getNotification",
                { newNotification: result[0].notifications },
                () => {
                    console.log("new notification send to")
                    console.log(creator.socketId)
                })
        }


        const notification = {
            actionType: type,
            postId,
            likedUserName: username,
            likedUserId: userId,
            createdAt: new Date()
        }
        const userExists = await notificationModel.findOne({ id: creatorId })
        if (userExists) {
            console.log("user exists in collection")

            const isNotificationExists = await notificationModel.findOne(
                {
                    id: creatorId,
                    "notifications.actionType": type,
                    "notifications.postId": postId
                }
            )
            if (isNotificationExists) {
                console.log("notification already exists ")
            } else {
                console.log("notification not in collection")

                await notificationModel.updateOne(
                    { id: creatorId },
                    { $push: { notifications: notification } }
                )
                await sendNotificationToAuther()
            }
        } else {
            console.log("user not  exists in collection")

            const newNotification = await notificationModel.create({
                id: creatorId,
                notifications: [notification]
            })
            await sendNotificationToAuther()

        }
    } catch (error) {
        console.log(error)
    }


}


export const likePost = async (socket, data) => {
    const { username, postId, creatorId } = data
    const { userId, id } = socket
    console.log(data, userId)

    try {
        const islikeDocExsist = await likeModel.findOne({ _id: postId })

        const updateLikeCount = async () => {
            const result = await likeModel.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(postId) } },
                {
                    $project:
                        { likeCount: { $size: "$user" } }
                }
            ])
            await postModel.updateOne({ _id: postId }, { like_count: result[0].likeCount })
            console.log("count updated " + (result[0].likeCount))
            return result[0].likeCount
        }




        if (islikeDocExsist) {
            console.log('exists')
            const isUserExists = await likeModel.findOne({ _id: postId, 'user.id': userId })
            if (isUserExists) {
                console.log('user exists')
                const data = await likeModel.updateOne(
                    { _id: postId, 'user.id': userId }
                    , { $pull: { user: { id: userId } } }
                )
                const likecount = await updateLikeCount()
                io.to(id).emit("postDisliked", { likecount, isLiked: false })

            } else {
                console.log('user not exists')
                const data = await likeModel.updateOne(
                    { _id: postId },
                    { $push: { user: { id: userId, name: username } } }
                )
                const likecount = await updateLikeCount()
                io.to(id).emit("postLiked", { likecount, isLiked: true })
            }

        } else {
            console.log('new doc')
            const newlikedoc = new likeModel({
                _id: postId,
                user: [{ id: userId, name: username }]
            })
            await newlikedoc.save()
            const likecount = await updateLikeCount()
            io.to(id).emit("postLiked", { likecount, isLiked: true })
        }

        console.log("likeSuccess")

    } catch (error) {
        console.log(error)
        // res.status(400).json({ message: `like post failed ${error}` })
        io.to(id).emit("likePostFailedRes", { error })
    }

}