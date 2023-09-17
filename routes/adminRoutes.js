import express from 'express'
import { adminLogin, adminLogout } from '../controllers/admin/adminAuth.js'
import {
  getAllCounts, getAllUsers, getErrorLogs, getHomeChartData, getReqLogs,
} from '../controllers/admin/adminOther.js'
import adminAuth from '../middleware/adminAuth.js'
import { getPosts } from '../controllers/posts.js'



const router = express.Router()

router.post('/login', adminLogin)
router.post('/logout', adminLogout)


router.get('/counts', adminAuth, getAllCounts)
router.get('/chartData', getHomeChartData)

router.get('/users', adminAuth, getAllUsers)

router.get('/posts', adminAuth, getPosts)

router.get('/logs/req', getReqLogs)
router.get('/logs/error', getErrorLogs)








export default router