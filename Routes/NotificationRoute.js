import express from 'express'
import { getUserNotifications } from '../Controllers/NotificationController.js'

const router = express.Router()

router.get('/all/:currentUser', getUserNotifications)

export default router
