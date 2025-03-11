import express from 'express'
import { getUserNotifications, readNotification } from '../Controllers/NotificationController.js'

const router = express.Router()

router.get('/all/:currentUser', getUserNotifications)
router.put('/read', readNotification)

export default router
