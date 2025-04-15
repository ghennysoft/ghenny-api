import express from 'express'
import {  } from '../Controllers/CommentController.js'
import { addAnswer, dislikeAnswer, likeAnswer } from '../Controllers/AnswerController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.post('/add', authUser, addAnswer)
router.post('/like', authUser, likeAnswer)
router.post('/dislike', authUser, dislikeAnswer)

export default router
