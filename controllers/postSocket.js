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
            let result
            if (data.type === 'message') {
                result = await notificationModel.aggregate([
                    {
                        $match: {
                            id: creatorId,
                            [`messageNotifications.${userId}.messageCount`]: { $exists: true }
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            totalMessageCount: 1,
                            newMessageNotification: `$messageNotifications.${userId}`
                        }
                    }
                ])
                console.log("result", result[0])

                io.to(creator.socketId).emit("getNotification",
                    { newNotification: result[0] },
                    () => {
                        console.log("new notification send to")
                        console.log(creator.socketId)
                    })
            } else {
                result = await notificationModel.aggregate([
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

        }

        let notification
        let userIdValue
        if (data.type === 'message') {
            userIdValue = {
                actionType: type,
                authorName: username,
                authorId: userId,
                createdAt: new Date()
            }

        } else {
            notification = {
                actionType: type,
                postId,
                likedUserName: username,
                likedUserId: userId,
                createdAt: new Date()
            }
        }


        const userExists = await notificationModel.findOne({ id: creatorId })
        if (userExists) {
            console.log("user exists in collection")

            if (data.type === 'message') {
                const isUserKeyExists = await notificationModel.updateOne(
                    {
                        id: creatorId,
                        [`messageNotifications.${userId}`]: { $exists: true }
                    },
                    {
                        $inc: {
                            totalMessageCount: 1,
                            [`messageNotifications.${userId}.messageCount`]: 1
                        },
                    }
                )
                console.log("isUserKeyExists", isUserKeyExists)
                if (isUserKeyExists.modifiedCount === 0) {
                    const data = await notificationModel.updateOne(
                        { id: creatorId },
                        {
                            $set: { [`messageNotifications.${userId}`]: userIdValue, },
                        }
                    )
                    console.log("isUserKeyExists false", data)
                }
            } else {
                await notificationModel.updateOne(
                    { id: creatorId },
                    { $push: { notifications: notification } }
                )
            }
            await sendNotificationToAuther()
        } else {
            console.log("user not  exists in collection")
            if (data.type === 'message') {
                // const newNotification = await notificationModel.create({
                //     id: creatorId,
                //     messageNotifications: [notification]
                // })
                const data = await notificationModel.create({
                    id: creatorId,
                    totalMessageCount: 1,
                    messageNotifications: {
                        [userId]: { ...userIdValue, messageCount: 1 }
                    }
                })
                console.log(data)

            } else {
                const newNotification = await notificationModel.create({
                    id: creatorId,
                    notifications: [notification]
                })
            }
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


export const commentPost = async ({ socket, data }) => {
    const { userId, id } = socket
    const { postId, comment, username } = data

    console.log(postId, comment, username, userId)

    try {
        const isCommentDocExsist = await commentModel.findOne({ _id: postId })
        const updateCommentInPost = async () => {
            const result = await commentModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId.createFromHexString(postId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        commetSize: {
                            $size: "$comments"
                        },
                        postedComment: {
                            $let: {
                                vars: {
                                    sortedArray: {
                                        $sortArray: {
                                            input: "$comments",
                                            sortBy: {
                                                _id: 1,
                                            },
                                        },
                                    },
                                },
                                in: {
                                    $arrayElemAt: ["$$sortedArray", -1],
                                },
                            },
                        },
                    }
                }
            ])
            const data = await postModel.updateOne(
                { _id: postId },
                {
                    last_comment: result[0].postedComment,
                    comment_count: result[0].commetSize
                }
            )

            console.log(result[0].commetSize, result[0].postedComment, data)
            return result[0].postedComment
        }



        if (isCommentDocExsist) {
            const data = await commentModel.updateOne(
                { _id: postId },
                {
                    $push: {
                        comments: {
                            username,
                            userId,
                            comment
                        }
                    }
                }
            )
            const postedComment = await updateCommentInPost()
            io.to(id).emit("commentPostSuccess", { postedComment, postId })

        } else {
            const newComment = new commentModel({
                _id: new mongoose.Types.ObjectId(postId),
                comments: [{
                    username,
                    userId,
                    comment
                }]
            })
            const data = await newComment.save()

            const postedComment = await updateCommentInPost()
            io.to(id).emit("commentPostSuccess", { postedComment, postId })
        }

    } catch (error) {
        io.to(id).emit("commentPostFailed", error)
    }
}


