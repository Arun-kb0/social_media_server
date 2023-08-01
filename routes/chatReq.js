import express from "express";
import { addChatUser, getChatUsers, getMessages } from "../controllers/chatReq.js";
import auth from "../middleware/auth.js";

const router = express.Router()

router.get('/', auth, getChatUsers)
router.get('/message',auth ,getMessages)
router.post('/addUser', addChatUser)


export default router