import express from 'express'
import {  } from '../Controllers/CommentController.js'
import { addAnswer, dislikeAnswer, likeAnswer } from '../Controllers/AnswerController.js'

const router = express.Router()

router.post('/add', addAnswer)
router.post('/like', likeAnswer)
router.post('/dislike', dislikeAnswer)

export default router
