import express from 'express'
import { addQuestion, addSubject, addUserSubject, dislikeQuestion, getQuestions, getSingleQuestion, getSubjects, likeQuestion } from '../Controllers/QuestionController.js'

const router = express.Router()

router.put('/user/subject/add', addUserSubject)
router.post('/subject/add', addSubject)
router.get('/subject/all', getSubjects)

router.post('/like', likeQuestion)
router.post('/dislike', dislikeQuestion)
router.post('/add', addQuestion)
router.get('/all', getQuestions)
router.get('/:id', getSingleQuestion)

export default router