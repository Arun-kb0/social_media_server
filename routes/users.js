import express from 'express'
import {
    signUp, signIn, socialSignIn, getUsers, follow,
    getFollowing,logout, getAllNotifications, removeAllNotifications, removeNotification, unfollow
} from '../controllers/users.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.post('/signin', signIn)
router.post('/signup', signUp)
router.post('/socialAuth', socialSignIn)
router.post('/logout' ,logout)

router.get('/users', auth, getUsers)
router.post('/follow', auth, follow)
router.patch('/unfollow',auth,  unfollow)
router.get('/following',auth, getFollowing)

router.get('/notifications',auth, getAllNotifications)
router.patch('/notifications',auth, removeAllNotifications)
router.patch('/RemoveNotification',auth, removeNotification)

export default router