import express from 'express'
import { addSubject, getSubjects } from '../Controllers/QuestionController.js'

const router = express.Router()

router.post('/subject/add', addSubject)
router.get('/subject/all', getSubjects)

export default router
