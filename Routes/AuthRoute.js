import express from 'express'
import { completeUser, loginUser, registerUser, studyAtSearch } from '../Controllers/AuthController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/:id', completeUser)
router.get('/search', studyAtSearch)

export default router
