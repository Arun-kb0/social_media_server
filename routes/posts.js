import express from 'express'
import {
  getPosts, createPost, deletePost, editPost, getLiked,
  getComments, getUserPosted, deleteComment
} from '../controllers/posts.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/', getPosts)
router.post('/', auth, createPost)
router.delete('/', auth, deletePost)
router.patch('/', auth, editPost)

router.get('/userposts', auth, getUserPosted)


router.post('/getliked', auth, getLiked)

router.get('/comment', getComments)
router.post('/deleteComment', auth, deleteComment)

export default router