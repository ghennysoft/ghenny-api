import express from 'express'
import { createPage, getPages, getSinglePage, editSchoolAndCurrentYear, addPageAdmin, followPage, notePage, commentPage, createPagePost, getPagePosts} from '../Controllers/PageController.js'
import { uploadPost } from '../utils/upload.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

// router.post('/create', authUser, uploadPost.array('media'), createPage)
router.post('/create', authUser, createPage)
router.get('/getAll', authUser, getPages)
router.get('/:id', authUser, getSinglePage)
router.put('/edit', authUser, editSchoolAndCurrentYear)
router.post('/:id/admins', authUser, addPageAdmin)
router.put('/:id/follow', authUser, followPage)
router.put('/:id/post', authUser, createPagePost)
router.get('/:id/posts', authUser, getPagePosts)
router.post('/:id/rate', authUser, notePage)
router.post('/:id/comments', authUser, commentPage)

export default router
