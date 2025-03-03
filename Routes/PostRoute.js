import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, getTimelinePosts, likeDislikePost, updatePost } from '../Controllers/PostController.js'
import { uploadPostS3 } from '../utils/aws.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.get('/all', authUser, getAllPosts)
router.post('/create', uploadPostS3.array('media'), createPost)
router.put('/like', likeDislikePost)
router.get('/feed', authUser, getTimelinePosts)
router.get('/:id', getPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)

export default router
