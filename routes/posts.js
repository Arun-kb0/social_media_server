import express from 'express'
import { getPosts, createPost, deletePost, editPost, likePost, getLiked, commentPost, getComments } from '../controllers/posts.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/', getPosts)
router.post('/', auth, createPost)
router.delete('/', auth, deletePost)
router.patch('/',auth, editPost)

router.post('/like',auth , likePost)
router.post('/getliked', auth , getLiked)

router.post('/comment',auth, commentPost)
router.get('/comment', getComments)

export default router