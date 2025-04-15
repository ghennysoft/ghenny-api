import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, getTimelinePosts, likeDislikePost, updatePost } from '../Controllers/PostController.js'
import { uploadPostS3 } from '../utils/aws.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.get('/all', authUser, getAllPosts)
router.post('/create', authUser, uploadPostS3.array('media'), createPost)
router.put('/like', authUser, likeDislikePost)
router.get('/feed', authUser, getTimelinePosts)
router.get('/:id', authUser, getPost)
router.put('/:id', authUser, updatePost)
router.delete('/:id', authUser, deletePost)

export default router
