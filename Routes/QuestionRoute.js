import express from 'express'
import { addSubject, addUserSubject, getSubjects } from '../Controllers/QuestionController.js'

const router = express.Router()

router.post('/subject/add', addSubject)
router.get('/subject/all', getSubjects)
router.put('/user/subject/add', addUserSubject)

export default router
