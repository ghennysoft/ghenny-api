import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, getUserPost, likeDislikePost, updatePost } from '../Controllers/PostController.js'

const router = express.Router()

router.get('/all', getAllPosts)
router.post('/create', createPost)
router.get('/:id', getPost)
router.get('/user/:id', getUserPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)
router.put('/like', likeDislikePost)

export default router
