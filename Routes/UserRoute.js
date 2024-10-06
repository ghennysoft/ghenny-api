import express from 'express'
import { deleteUser, getProfile, searchUsers, updateProfile } from '../Controllers/UserController.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

router.get('/search', searchUsers)
router.get('/:id', getProfile)
router.put('/:id', updateProfile)
router.delete('/:id', verifyToken, deleteUser)

export default router
