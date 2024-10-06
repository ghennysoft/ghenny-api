import express from 'express'
import { generateAccessToken, loginUser, registerUser, studyAtSearch } from '../Controllers/AuthController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/refresh_token', generateAccessToken)
router.get('/search', studyAtSearch)

export default router
