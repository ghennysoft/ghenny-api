import express from 'express'
import { addMembers, createGroup, getGroups, getSingleChat, getUserChats, getUsers, sendMessage } from '../Controllers/ChatController.js'

const router = express.Router()

router.get('/searchUser', getUsers)
router.post('/group', createGroup)
router.get('/group/:userId', getGroups)
router.post('/members', addMembers)
router.get('/chats/:currentUser', getUserChats)
router.get('/chat/:firstId/:secondId', getSingleChat)
router.post('/send/:receiverId', sendMessage)

export default router
