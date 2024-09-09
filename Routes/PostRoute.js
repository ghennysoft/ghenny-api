import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, likeDislikePost, updatePost } from '../Controllers/PostController.js'

const router = express.Router()

router.get('/all', getAllPosts)
router.post('/create', createPost)
router.get('/:id', getPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)
router.put('/like', likeDislikePost)

export default router
