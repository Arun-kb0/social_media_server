import express from 'express'
import { getPosts, createPost, deletePost, editPost } from '../controllers/posts.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/', getPosts)
router.post('/', auth, createPost)
router.delete('/', auth, deletePost)
router.patch('/', editPost)


export default router