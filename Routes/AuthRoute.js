import express from 'express'
import { completeProfileSuggestions, generateAccessToken, loginUser, logoutUser, registerUser } from '../Controllers/AuthController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.post('/refresh_token', generateAccessToken)
router.get('/complete/suggestion', completeProfileSuggestions)

export default router
