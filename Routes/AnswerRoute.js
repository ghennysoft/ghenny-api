import express from 'express'
import {  } from '../Controllers/CommentController.js'
import { acceptAnswer, addAnswer, voteAnswer } from '../Controllers/AnswerController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.post('/add', authUser, addAnswer)
router.post('/:answerId/vote', authUser, voteAnswer)
// router.post('/:AnswerId/report', authUser, reportAnvoteAnswer)
// router.post('/:AnswerId/save', authUser, saveQuestion)
router.post('/:questionId/accept-answer', authUser, acceptAnswer)

export default router
