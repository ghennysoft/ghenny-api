import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, likePost, updatePost } from '../Controllers/PostController.js'

const router = express.Router()

router.get('/all', getAllPosts)
router.post('/create', createPost)
router.get('/:id', getPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)
router.put('/:id/like', likePost)

export default router
