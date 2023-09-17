import express from 'express'
import { adminLogin, adminLogout } from '../controllers/admin/adminAuth.js'
import {  getAllCounts, getAllUsers, getHomeChartData } from '../controllers/admin/adminAppUsers.js'
import auth from '../middleware/auth.js'



const router = express.Router()

router.post('/login', adminLogin)
router.post('/logout', adminLogout)

router.get('/users',auth, getAllUsers)
router.get('/counts', auth, getAllCounts)
router.get('/chartData',getHomeChartData)







export default router