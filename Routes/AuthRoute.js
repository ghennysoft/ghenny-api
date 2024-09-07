import express from 'express'
import { competeUser, loginUser, registerUser } from '../Controllers/AuthController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.put('/:id', competeUser)

export default router
