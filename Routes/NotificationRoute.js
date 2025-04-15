import express from 'express'
import { getUserNotifications, readNotification } from '../Controllers/NotificationController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.get('/all/:currentUser', authUser, getUserNotifications)
router.put('/read', authUser, readNotification)

export default router
