import express from 'express'
import { deleteUser, getUser, updateUser } from '../Controllers/UserController.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

router.get('/:id', getUser)
router.put('/:id', verifyToken, updateUser)
router.delete('/:id', verifyToken, deleteUser)

export default router
