import mongoose, { isValidObjectId } from "mongoose"
import { postModel } from "../models/postsModel.js"
import { likeModel } from "../models/likeModel.js"
import { commentModel } from "../models/commentModel.js"
import { allUsersModel } from '../models/allUsersModel.js'

// * get post
export const getPosts = async (req, res) => {
    const { page } = req.query
    console.log("page " + page)
    try {
        const LIMIT = 8
        const startIndex = (Number(page) - 1) * LIMIT
        const total = await postModel.countDocuments({})
        const posts = await postModel.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex)
        res.status(200).json({
            posts,
            currentPage: Number(page),
            numberOfPages: Math.ceil(total / LIMIT)
        })
    } catch (error) {
        // console.log(error)
        res.status(404).json({ message: error.message })
    }
}

export const getUserPosted = async (req, res) => {
    // const {userId} = req.query //for testing
    const { userId } = req
    console.log(userId)

    try {
        const userPosts = await postModel.find({ creator_id: userId })
        res.status(200).json({ message: 'getUserPost success ', userPosts })
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: 'getUserPosts failed ', error })
    }
}

// * create post
export const createPost = async (req, res) => {
    const post = req.body
    const newPost = new postModel({
        ...post,
        creator_id: req.userId,
        createdAt: new Date().toString()
        
    })

    try {
        await newPost.save()
        res.status(200).json({ message: 'post created. ', newPost })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// * delete post 
export const deletePost = async (req, res) => {
    const { postId } = req.query
    console.log(postId)
    try {

        if (!isValidObjectId(postId))
            throw new Error('not Type ObjectId')
        const { acknowledged, deletedCount } = await postModel.deleteOne({ _id: postId, })

        if (acknowledged && deletedCount === 1)
            res.status(200).json({ message: 'Post deleted' })
        else
            throw new Error({ acknowledged, deletedCount })

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: `Failed to delete post - ${error.message}` })
    }
}


// * edit
export const editPost = async (req, res) => {
    const { updatedPost } = req.body
    try {
        const data = await postModel.updateOne(
            { _id: updatedPost._id },
            { ...updatedPost, createdAt: new Date().toString() }
        )
        const post = await postModel.findOne({ _id: updatedPost._id })
        console.log(data)
        res.status(200).json({
            message: 'update post success',
            post
        })
    } catch (error) {
        // console.log(error)
        res.staus(400).json({ message: `update post failed ${error.message}` })

    }

}




// * getliked posts
export const getLiked = async (req, res) => {
    // const { postIds, userId } = req.body // for test

    const { body: { postIds }, userId } = req
    // console.log(postIds, userId)

    const ids = postIds?.map(id => mongoose.Types.ObjectId.createFromHexString(id))
    try {
        let result
        if (ids.length > 0) {
            result = await likeModel.aggregate([
                {
                    $match: {
                        _id: { $in: ids },
                        "user.id": userId
                    }
                },
                {
                    $group: {
                        _id: { $toString: "$_id" }
                    }
                }
            ])


            const likedPosts = result.map((obj) => obj._id.toString())
            // console.log(likedPosts)
            res.status(200).json({
                message: 'getLikedPost success ',
                likedPosts
            })
        } else {
            throw new Error(`post length ${postIds.length}`)
        }
    } catch (error) {
        // console.log(error)
        res.status(404).json({ message: `getLikesPosts failed ${error}` })
    }
}



// * get comments 
export const getComments = async (req, res) => {
    const { postId } = req.query
    console.log(postId)
    try {
        const result = await commentModel.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId.createFromHexString(postId)
                }
            },
            {
                $project: {
                    _id: 1,
                    commetSize: {
                        $size: "$comments"
                    },
                    postComments: {
                        $sortArray: {
                            input: "$comments",
                            sortBy: {
                                _id: -1,
                            },
                        },
                    },
                }
            }
        ])
        res.status(200).json({
            message: 'getComment success ',
            comments: result[0]?.postComments ? result[0]?.postComments : null,
            _id: result[0]?._id ? result[0]?._id : null,
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({ messgae: `getComments failed ${error} ` })
    }
}


export const deleteComment = async (req, res) => {
    const { userId, body: { postId, commentId, commentedUserId, creatorId } } = req

    console.log(postId, creatorId, commentId, commentedUserId)
    console.log("creatorId", creatorId, "commentedUserId", commentedUserId, "userId", userId, "postId", postId)

    try {
        console.log(commentedUserId === userId)
        console.log(userId === creatorId)
        if (commentedUserId === userId | userId === creatorId) {
            const data = await commentModel.updateOne(
                { _id: postId, "comments._id": commentId },
                { $pull: { comments: { _id: commentId } }, }
            )

            const result = await commentModel.aggregate([
                { $match: { _id: mongoose.Types.ObjectId.createFromHexString(postId) } },
                {
                    $project: {
                        _id: 0,
                        count: {
                            $size: '$comments'
                        }
                    }
                }
            ]);
            console.log(result[0].count)

            if (result[0].length > 0) {
                const postData = await postModel.updateOne(
                    { _id: postId },
                    { comment_count: result.count }
                )
                console.log("postData", postData)
            }

            console.log(data)
            res.status(200).json({ message: 'delete comment success', count: result[0].count })
            return
        }

        console.log('unauthorized')
        res.status(401).json({ message: 'unauthorized action' })
    } catch (error) {
        console.log(error)
        res.status(200).json({ message: 'delete comment failed', error })
    }
}



