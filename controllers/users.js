import { userModel } from "../models/usersModel.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { socialUserModel } from "../models/socialUserModel.js"
import { allUsersModel } from "../models/allUsersModel.js"
import { followModel } from "../models/followModel.js"
import { notificationModel } from "../models/notificationModel.js"
import mongoose from "mongoose"
import { joinRoom } from "./chatSocket.js"




export const setIsOnline = async ({ userId, state }) => {
    console.log("set user online ", state)
    console.log(userId)
    try {
        const result = await allUsersModel.findOneAndUpdate(
            { id: userId },
            { isOnline: state },
            { new: true }
        )

        const data = await followModel.updateMany(
            { "following.id": userId },
            { $set: { "following.$.isOnline": state } }
        )
        console.log(data)
        return result
    } catch (error) {
        console.log(error)
    }

}




export const signIn = async (req, res) => {
    const { email, password } = req.body
    console.log(email, password)
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'user does not exists' })
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect)
            return res.status(400).json({ message: 'Invaild Credentials' })

        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, 'test', { expiresIn: '1h' })

        const result = await setIsOnline({ userId: user.id, state: true })
        res.status(200).json({ result, token, })

    } catch (error) {
        res.status(401).json({ message: `login failed `, error })
    }

}

export const signUp = async (req, res) => {
    const { email, password, firstName, lastName } = req.body
    try {
        const exisitingUser = await userModel.findOne({ email })
        if (exisitingUser) {
            return res.status(400).json({ message: 'user already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await userModel.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`
        })

        await userModel.updateOne(
            { _id: user._id },
            { id: user._id }
        )

        let result
        result = await allUsersModel.create({
            email,
            name: `${firstName} ${lastName}`,
            picture: '',
            id: user._id,
            isOnline: true
        })

        const token = jwt.sign({
            email: result.email, id: result.id
        }, 'test', { expiresIn: '1h' })

        result = await setIsOnline({ userId: user._id, state: true })

        res.status(200).json({ result, token })
    } catch (error) {
        console.log(error)
        res.status(401).json({ message: 'auth failed ', error })
    }
}

export const socialSignIn = async (req, res) => {
    const { provider, data } = req.body
    // console.log(data)
    try {
        const user = await socialUserModel.findOne({ id: data.sub })
        let result
        if (user === null) {
            const newSocialUser = await socialUserModel.create({
                name: data.name,
                email: data.email,
                picture: data.picture,
                provider: provider,
                id: data?.sub,
            })
            result = await allUsersModel.create({
                email: data.email,
                name: data.name,
                provider,
                picture: data.picture,
                id: data.sub,
                isOnline: true
            })
        }

        result = await setIsOnline({ userId: user.id, state: true })
        console.log(result)
        res.status(200).json({ message: 'auth success ', result })
    } catch (error) {
        res.status(401).json({ message: 'auth failed ', error })
    }
}

export const logout = async (req, res) => {
    const { userId } = req.query
    try {
        const data = await setIsOnline({ userId: userId, state: false })
        res.status(200).json({ message: 'logout success' })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: 'logout failed', error })
    }
}

export const getUsers = async (req, res) => {
    const { page } = req.query
    console.log(page)
    try {
        const LIMIT = 8
        const startIndex = (Number(page) - 1) * LIMIT
        const total = await allUsersModel.countDocuments({})
        const users = await allUsersModel.find().limit(LIMIT).skip(startIndex)
        res.status(200).json({
            message: "getUsers success",
            users,
            currentPage: Number(page),
            numberOfPages: Math.ceil(total / LIMIT)
        })
    } catch (error) {
        // console.log(error)
        res.status(404).json({ message: 'users not found', error })
    }
}


export const follow = async (req, res) => {
    // const { ownerName, followUserId, name, photo, userId } = req.body
    const { body: { ownerName, ownerPhoto, followUserId, name, photo }, userId } = req

    console.log(followUserId, name, photo, ownerName, userId)
    try {
        const updateFollower = async () => {
            const followerData = {
                photo: null,
                name: ownerName,
                id: userId
            }
            const exists = await followModel.findOne({ id: followUserId })
            console.log(exists)
            if (exists) {
                const data = await followModel.updateOne(
                    { id: followUserId },
                    { $push: { followerData } }
                )
            } else {
                const data = await followModel.create({
                    ownername: name,
                    id: followUserId,
                    followers: [followerData]
                })


            }
        }

        let result
        const follower = await allUsersModel.findOne({ id: followUserId })
        const followingUserData = {
            photo: photo ? photo : null,
            name,
            id: followUserId,
            isOnline: follower.isOnline
        }
        const isExists = await followModel.findOne({ id: userId })
        if (isExists) {
            const isUserFollowing = await followModel.findOne(
                { id: userId, 'following.id': followUserId }
            )
            if (!isUserFollowing) {
                result = await followModel.updateOne(
                    { id: userId },
                    { $push: { following: followingUserData } }
                )
                await updateFollower()
            }
        } else {
            result = await followModel.create({
                ownername: ownerName,
                id: userId,
                following: [followingUserData]
            })
            await updateFollower()
        }

        // from chatsocket
        let roomId
        if (userId > followUserId) {
            roomId = userId + followUserId
        } else {
            roomId = followUserId + userId
        }
        const data = {
            currentUserId: userId,
            currentUsername: ownerName,
            currentUserPhoto: ownerPhoto,
            roomId,
            chatUserId: followUserId,
            chatUserName: name,
            chatUserPhoto: photo,
        }
        joinRoom(null, data)

        res.status(200).json({ message: 'follow success ', following: followingUserData })
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: 'follow failed ', error })
    }
}


export const unfollow = async (req, res) => {
    const { userId, query: { followingId } } = req
    console.log(userId, followingId)

    try {
        const data = await followModel.updateOne(
            { id: userId },
            { $pull: { following: { id: followingId } } }
        )
        console.log(data)
        res.status(200).json({ message: "unfollow success", data })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "unfollow faild", error })
    }
}


export const getFollowing = async (req, res) => {
    // const { userId } = req.query
    const { userId } = req
    console.log(userId)
    try {
        const data = await followModel.findOne({ id: userId })
        // console.log(data)
        res.status(200).json({ message: "get following success", following: data?.following })
    } catch (error) {
        console.log(error)
        res.status(400).json({ messgae: "get following faild " })
    }
}

export const getFollowers = async (req, res) => {
    // const {userId} = req.query
    const { userId } = req
    console.log("get followers",userId)
    try {
        const result = await followModel.aggregate([
            { $match: { id: userId } },
            {$project: {_id:0 , followers:1}}
        ])
        console.log(result[0])
        
        res.status(200).json({
            message: "get followers success",
            followers: result[0]?.followers
                ? result[0].followers 
                : null
        })
    } catch (error) {
        console.log(error)
        res.status(401).json({message:"get followers faild" ,error })
    }
}


export const getAllNotifications = async (req, res) => {
    // const { userId } = req.query
    const { userId } = req
    try {
        const data = await notificationModel.findOne({ id: userId })
        res.status(200).json({ message: "getAllNotifications success", data })
    } catch (error) {
        res.status(400).json({ message: "getAllNotifications faild" })
    }
}

export const removeAllNotifications = async (req, res) => {
    // const { userId } = req.query
    const { userId } = req
    try {
        const data = await notificationModel.updateOne(
            { id: userId },
            { notifications: [] }
        )
        res.status(200).json({ message: "removeNotifications success", data })
    } catch (error) {
        res.status(400).json({ message: "removeNotifications faild", error })
    }
}

export const removeNotification = async (req, res) => {
    // let { notificationId, creatorId } = req.query
    let { body: { notificationId, type }, userId } = req
    console.log(notificationId, type, userId)
    // notificationId = new mongoose.Types.ObjectId(notificationId)
    try {
        let data
        if (type === 'message') {
            console.log("message notification")
            data = await notificationModel.updateOne(
                {
                    id: userId,
                    [`messageNotifications.${notificationId}.messageCount`]: { $exists: true }
                },
                {
                    totalMessageCount: 0,
                    [`messageNotifications.${notificationId}.messageCount`]: 0
                }
            )
        } else {
            data = await notificationModel.updateOne(
                {
                    id: userId,
                    "notifications._id": notificationId,
                },
                {
                    $pull: {
                        "notifications": {
                            _id: notificationId,
                        }
                    }
                }
            )
        }
        console.log(data)
        res.status(200).json({ message: "removeNotification success", data })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "removeNotification faild", error })
    }
}
