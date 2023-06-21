import { isValidObjectId } from "mongoose"
import { postModel } from "../models/postsModel.js"


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
        console.log(error)
        res.status(404).json({ message: error.message })
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
        res.status(200).json(newPost)
    } catch (error) {
        res.status(409).json({ message: error.message })
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
        res.status(500).json({ message: `Failed to delete post - ${error.message}` })
    }
}


// * edit
export const editPost = async (req, res) => {
    const { updatedPost } = req.body
    try {
        const ed = await postModel.updateOne(
            { _id: updatedPost._id },
            { ...updatedPost, createdAt: new Date().toString() }
        )
        const post = await postModel.findOne({ _id: updatedPost._id })
        console.log(ed)
        res.status(200).json({
            message: 'update post success',
            post
        })
    } catch (error) {
        console.log(error)
        res.staus(200).json({ message: `update post failed ${error.message}` })

    }

}