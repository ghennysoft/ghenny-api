import express from 'express'
import { addComment, getAllComments } from '../Controllers/CommentController.js'

const router = express.Router()

router.post('/add', addComment)
router.get('/', getAllComments)

export default router
