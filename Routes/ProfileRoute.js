import express from 'express'
import { completeProfile, deleteUser, followUnfollowUser, getBirthdayWishes, getProfile, getUserData, getUsersToPin, postBirthdayWish, searchData, suggestStudyAt, updatePicture, updateProfile } from '../Controllers/ProfileController.js'
import verifyToken from '../verifyToken.js'

const router = express.Router()

router.get('/search', searchData)
router.put('/followUnfollow', followUnfollowUser)
router.get('/suggest', suggestStudyAt)
router.post('/wish', postBirthdayWish)
router.get('/topin/:id', getUsersToPin)
router.get('/:id', getProfile)
router.put('/:id', updateProfile)
router.put('/picture/:id', updatePicture)
router.delete('/:id', verifyToken, deleteUser)
router.get('/data/:id', getUserData)
router.get('/wishes/:userId/:year', getBirthdayWishes)
router.put('/complete/:profileId/:userId', completeProfile)

export default router
