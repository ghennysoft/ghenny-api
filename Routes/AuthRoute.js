import express from 'express'
import { domainSearch, generateAccessToken, loginUser, registerUser } from '../Controllers/AuthController.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/refresh_token', generateAccessToken)
// router.post('/school/add', addSchool)
// router.get('/search/studyAt', studyAtSearch)
router.get('/search/domain', domainSearch)

export default router
