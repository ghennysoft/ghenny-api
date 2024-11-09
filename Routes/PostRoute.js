import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, getTimelinePosts, getUserPost, likeDislikePost, updatePost } from '../Controllers/PostController.js'

const router = express.Router()

router.get('/all', getAllPosts)
router.post('/create', createPost)
router.put('/like', likeDislikePost)
router.get('/feed/:id', getTimelinePosts)
router.get('/:id', getPost)
router.get('/user/:id', getUserPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)

export default router
