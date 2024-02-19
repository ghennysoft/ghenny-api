import express from 'express'

const router = express.Router()

router.get('/', async(req, res) => {res.send('User router')})

export default router
