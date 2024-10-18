import express from 'express'
import { addQuestion, addSubject, addUserSubject, getQuestions, getSubjects } from '../Controllers/QuestionController.js'

const router = express.Router()

router.put('/user/subject/add', addUserSubject)
router.post('/subject/add', addSubject)
router.get('/subject/all', getSubjects)

router.post('/add', addQuestion)
router.get('/all', getQuestions)

export default router
