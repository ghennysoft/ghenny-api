import express from 'express'
import { getPosts } from '../Controllers/PostController.js'

const router = express.Router()

router.get('/', getPosts)

export default router
