import { postModel } from "../models/postsModel.js"

export const getPosts =async (req,res)=>{
    res.status(200).send('posts')
}

export const createPost = async(req,res)=>{
    const post = req.body
    const newPost = new postModel({
        ...post,
        createdAt: new Date().toString()
    })
    try{
        await newPost.save()
        res.status(200).json(newPost)
    }catch(error){
        res.status(409).json({message: error.message})
    }
}

