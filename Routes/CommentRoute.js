import express from 'express'
import { addComment, likeDislikeComment } from '../Controllers/CommentController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.post('/add', authUser, addComment)
router.put('/like', authUser, likeDislikeComment)

export default router
