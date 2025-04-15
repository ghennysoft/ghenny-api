import express from 'express'
import { addMembers, createGroup, getGroups, getSingleChat, getUserChats, getUsers, sendMessage } from '../Controllers/ChatController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.get('/searchUser', authUser, getUsers)
router.post('/group', authUser, createGroup)
router.get('/group/:userId', authUser, getGroups)
router.post('/members', authUser, addMembers)
router.get('/chats/:currentUser', authUser, getUserChats)
router.get('/chat/:firstId/:secondId', authUser, getSingleChat)
router.post('/send/:receiverId', authUser, sendMessage)

export default router
