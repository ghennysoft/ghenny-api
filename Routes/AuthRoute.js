import express from 'express'
import { completeUser, loginUser, registerUser } from '../Controllers/AuthController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/:id', completeUser)

export default router
