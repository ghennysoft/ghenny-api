import express from 'express'
import { completeProfile, deleteUser, followUnfollowUser, getBirthdayWishes, getProfile, postBirthdayWish, searchData, suggestStudyAt, updatePicture, updateProfile } from '../Controllers/ProfileController.js'
import { verifyToken } from '../verifyToken.js'

const router = express.Router()

router.get('/search', searchData)
router.put('/followUnfollow', followUnfollowUser)
router.get('/suggest', suggestStudyAt)
router.post('/wish', postBirthdayWish)
router.get('/wishes/:userId/:year', getBirthdayWishes)
router.get('/:id', getProfile)
router.put('/complete/:profileId/:userId', completeProfile)
router.put('/:id', updateProfile)
router.put('/picture/:id', updatePicture)
router.delete('/:id', verifyToken, deleteUser)

export default router
