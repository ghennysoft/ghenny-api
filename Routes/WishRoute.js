import express from 'express'
import WishModel from "../Models/wishModel.js";
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.post('/create', authUser, async (req, res) => {
    try {
        if(!req.body.content) {
            res.status(400).json('Ajoutez du contenu...')
        } else {
            const newWish = new WishModel(req.body);
            await newWish.save();
            res.status(200).json(newWish)
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

export default router
