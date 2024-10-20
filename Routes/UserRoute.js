import express from 'express'
import { completeProfile, deleteUser, getProfile, searchUsers, updatePicture, updateProfile } from '../Controllers/UserController.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

router.get('/search', searchUsers)
router.get('/:id', getProfile)
router.put('/complete/:id', completeProfile)
router.put('/:id', updateProfile)
router.put('/picture/:id', updatePicture)
router.delete('/:id', verifyToken, deleteUser)

export default router
