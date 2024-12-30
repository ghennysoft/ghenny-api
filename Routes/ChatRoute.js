import express from 'express'
import { getSingleChat, getUserChats, getUsers, sendMessage } from '../Controllers/ChatController.js'

const router = express.Router()

router.get('/searchUser', getUsers)
router.get('/chats/:currentUser', getUserChats)
router.get('/chat/:firstId/:secondId', getSingleChat)
router.post('/send/:receiverId', sendMessage)

export default router
