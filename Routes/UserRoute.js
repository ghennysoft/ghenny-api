import express from 'express'
import { deleteUser, getUser, searchUsers, updateProfile } from '../Controllers/UserController.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

router.get('/search', searchUsers)
router.get('/:id', getUser)
router.put('/:id', updateProfile)
router.delete('/:id', verifyToken, deleteUser)

export default router
