import express from 'express'
import {  } from '../Controllers/CommentController.js'
import { addAnswer } from '../Controllers/AnswerController.js'

const router = express.Router()

router.post('/add', addAnswer)
// router.put('/like', likeDislikeComment)

export default router
