import express from 'express'
import { addQuestion, addSubject, addUserSubject, dislikeQuestion, getQuestions, getSingleQuestion, getSubjectQuestions, getSubjects, getUserQuestions, likeQuestion } from '../Controllers/QuestionController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.put('/user/subject/add', authUser, addUserSubject)
router.post('/subject/add', authUser, addSubject)
router.get('/subject/all', authUser, getSubjects)

router.post('/add', authUser, addQuestion)
router.post('/like', authUser, likeQuestion)
router.post('/dislike', authUser, dislikeQuestion)
router.get('/all/:userId', authUser, getQuestions)
router.get('/user/:userId', authUser, getUserQuestions)
router.get('/subject/:id', authUser, getSubjectQuestions)
router.get('/:id/:userId', authUser, getSingleQuestion)

export default router