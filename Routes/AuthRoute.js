import express from 'express'
import { completeProfileSuggestions, generateRefreshToken, loginUser, logoutUser, registerUser } from '../Controllers/AuthController.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', authUser, logoutUser)
router.post('/refresh_token', generateRefreshToken)
router.get('/complete/suggestion', authUser, completeProfileSuggestions)

export default router
