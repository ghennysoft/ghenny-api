import express from 'express'
import { createPost, deletePost, getAllPosts, getPost, getTimelinePosts, likeDislikePost, updatePost } from '../Controllers/PostController.js'
import { uploadS3 } from '../utils/aws.js'

const router = express.Router()

router.get('/all', getAllPosts)
router.post('/create', uploadS3.array('media'), createPost)
router.put('/like', likeDislikePost)
router.get('/feed/:id', getTimelinePosts)
router.get('/:id', getPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)

export default router
