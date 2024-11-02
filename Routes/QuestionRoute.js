import express from 'express'
import { addQuestion, addSubject, addUserSubject, dislikeQuestion, getQuestions, getSingleQuestion, getSubjectQuestions, getSubjects, likeQuestion } from '../Controllers/QuestionController.js'

const router = express.Router()

router.put('/user/subject/add', addUserSubject)
router.post('/subject/add', addSubject)
router.get('/subject/all', getSubjects)

router.post('/add', addQuestion)
router.get('/all', getQuestions)
router.post('/like', likeQuestion)
router.post('/dislike', dislikeQuestion)
router.get('/:id', getSingleQuestion)
router.get('/subject/:id', getSubjectQuestions)

export default router