import express from 'express'
import { addComment, likeDislikeComment } from '../Controllers/CommentController.js'

const router = express.Router()

router.post('/add', addComment)
router.put('/like', likeDislikeComment)

export default router
